const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function investigateSpaIssue() {
  console.log('🚨 ĐIỀU TRA VẤN ĐỀ 350 SPA - NGHIÊM TRỌNG');
  console.log('=========================================');

  try {
    // Kiểm tra structure của player_rankings trước
    const { data: sampleRanking, error: structError } = await supabase
      .from('player_rankings')
      .select('*')
      .limit(1);

    if (structError) throw structError;
    
    if (sampleRanking && sampleRanking.length > 0) {
      console.log('📊 Player rankings fields:', Object.keys(sampleRanking[0]));
    }

    // Tìm user có 350 SPA
    const { data: rankings, error: rankError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points')
      .eq('spa_points', 350)
      .limit(3);

    if (rankError) throw rankError;

    if (rankings && rankings.length > 0) {
      const userId = rankings[0].user_id;
      console.log(`\n📋 User có 350 SPA: ${userId.substring(0, 8)}...`);
      console.log('   SPA Points in player_rankings:', rankings[0].spa_points);

      // Tìm milestone data trong profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('milestones_completed')
        .eq('id', userId)
        .single();

      let milestonesCompleted = null;
      if (!profileError && profile && profile.milestones_completed) {
        milestonesCompleted = profile.milestones_completed;
        console.log('✅ Found milestones in profiles, count:', Object.keys(milestonesCompleted).length);
      }

      // Kiểm tra TỔNG từ spa_transactions
      const { data: allTx, error: txError } = await supabase
        .from('spa_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (txError) throw txError;

      console.log('\n📊 PHÂN TÍCH CHI TIẾT TRANSACTIONS:');
      console.log('===================================');
      
      let transactionTotal = 0;
      const sourceBreakdown = {};
      const dateBreakdown = {};
      
      allTx.forEach((tx, i) => {
        transactionTotal += tx.amount;
        const source = tx.source_type || 'unknown';
        const date = tx.created_at.substring(0, 10);
        
        sourceBreakdown[source] = (sourceBreakdown[source] || 0) + tx.amount;
        dateBreakdown[date] = (dateBreakdown[date] || 0) + tx.amount;
        
        console.log(`${(i+1).toString().padStart(2)}. [${date}] +${tx.amount.toString().padStart(3)} SPA | Total: ${transactionTotal.toString().padStart(3)}`);
        console.log(`    📝 ${tx.description}`);
        console.log(`    🏷️  Source: ${source}`);
        if (tx.reference_id) {
          console.log(`    🔗 Ref: ${tx.reference_id.substring(0, 12)}...`);
        }
        if (tx.metadata && Object.keys(tx.metadata).length > 0) {
          console.log(`    📋 Meta: ${JSON.stringify(tx.metadata).substring(0, 60)}...`);
        }
        console.log('');
      });

      console.log('\n🎯 TỔNG KẾT QUAN TRỌNG:');
      console.log('=========================');
      console.log(`📈 Total từ transactions: ${transactionTotal} SPA`);
      console.log(`🏆 SPA trong player_rankings: ${rankings[0].spa_points} SPA`);
      console.log(`⚖️  Khớp nhau: ${transactionTotal === rankings[0].spa_points ? '✅ ĐÚNG' : '❌ SAI - CHÊNH LỆCH ' + (rankings[0].spa_points - transactionTotal)}`);
      
      console.log('\n📊 BREAKDOWN THEO NGUỒN:');
      console.log('==========================');
      Object.entries(sourceBreakdown).forEach(([source, amount]) => {
        console.log(`   ${source.padEnd(20)}: +${amount.toString().padStart(3)} SPA`);
      });
      
      console.log('\n📅 BREAKDOWN THEO NGÀY:');
      console.log('========================');
      Object.entries(dateBreakdown).forEach(([date, amount]) => {
        console.log(`   ${date}: +${amount.toString().padStart(3)} SPA`);
      });

      // KIỂM TRA MILESTONES
      if (milestonesCompleted) {
        console.log('\n🎯 KIỂM TRA MILESTONES:');
        console.log('========================');
        const milestoneIds = Object.keys(milestonesCompleted);
        console.log(`   Tổng milestones completed: ${milestoneIds.length}`);
        
        let expectedFromMilestones = 0;
        let missingTransactions = 0;
        
        for (const milestoneId of milestoneIds) {
          const { data: milestone } = await supabase
            .from('milestones')
            .select('name, spa_reward')
            .eq('id', milestoneId)
            .single();

          if (milestone) {
            expectedFromMilestones += milestone.spa_reward;
            
            // Kiểm tra có transaction tương ứng không
            const hasTx = allTx.some(tx => tx.reference_id === milestoneId);
            
            console.log(`   📌 ${milestone.name}: +${milestone.spa_reward} SPA ${hasTx ? '✅' : '❌ THIẾU TX'}`);
            
            if (!hasTx) {
              missingTransactions++;
            }
          }
        }
        
        console.log(`\n💰 Expected từ milestones: ${expectedFromMilestones} SPA`);
        console.log(`📊 Actual từ transactions: ${transactionTotal} SPA`);
        console.log(`❗ Thiếu transactions: ${missingTransactions}`);
        console.log(`🔍 Chênh lệch: ${expectedFromMilestones - transactionTotal} SPA`);
        
        if (expectedFromMilestones !== transactionTotal) {
          console.log('\n🚨 VẤN ĐỀ PHÁT HIỆN:');
          console.log('=====================');
          console.log('❌ User đã complete milestones nhưng THIẾU transaction records');
          console.log('❌ Có thể do legacy data hoặc bug trong milestone completion flow');
          console.log('❌ SPA balance không khớp với transaction history');
          console.log('✅ Cần tạo transaction records cho các milestones bị thiếu');
        }
      }

      // Kiểm tra các nguồn SPA khác có thể bị thiếu
      console.log('\n🔍 KIỂM TRA NGUỒN KHÁC:');
      console.log('========================');
      
      // Challenges
      const { data: challenges } = await supabase
        .from('challenges')
        .select('id, challenger_spa_reward, challenged_spa_reward, status, challenger_id, challenged_id')
        .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
        .eq('status', 'completed');
        
      if (challenges && challenges.length > 0) {
        console.log(`   🎯 Challenges completed: ${challenges.length}`);
        challenges.forEach(c => {
          const isChallenger = c.challenger_id === userId;
          const reward = isChallenger ? c.challenger_spa_reward : c.challenged_spa_reward;
          console.log(`      Challenge ${c.id.substring(0, 8)}: +${reward} SPA`);
          
          // Kiểm tra có transaction không
          const hasChallengeTransaction = allTx.some(tx => tx.reference_id === c.id && tx.source_type === 'challenge_reward');
          console.log(`         Transaction: ${hasChallengeTransaction ? '✅' : '❌ THIẾU'}`);
        });
      }
      
      // Tournament results
      const { data: tournamentResults } = await supabase
        .from('tournament_results')
        .select('tournament_id, position, prize_spa')
        .eq('player_id', userId)
        .not('prize_spa', 'is', null);
        
      if (tournamentResults && tournamentResults.length > 0) {
        console.log(`   🏆 Tournament results: ${tournamentResults.length}`);
        tournamentResults.forEach(tr => {
          console.log(`      Tournament ${tr.tournament_id.substring(0, 8)}: +${tr.prize_spa} SPA`);
          
          // Kiểm tra có transaction không
          const hasTournamentTransaction = allTx.some(tx => tx.reference_id === tr.tournament_id && tx.source_type === 'tournament_prize');
          console.log(`         Transaction: ${hasTournamentTransaction ? '✅' : '❌ THIẾU'}`);
        });
      }

    } else {
      console.log('❌ Không tìm thấy user nào có đúng 350 SPA');
      
      // Tìm users có SPA gần 350
      const { data: nearbyUsers } = await supabase
        .from('player_rankings')
        .select('user_id, spa_points')
        .gte('spa_points', 300)
        .lte('spa_points', 400)
        .order('spa_points', { ascending: false })
        .limit(5);
        
      console.log('\n📋 Users có SPA gần 350:');
      if (nearbyUsers) {
        nearbyUsers.forEach(u => {
          console.log(`   ${u.user_id.substring(0, 8)}...: ${u.spa_points} SPA`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error during investigation:', error);
  }
}

investigateSpaIssue();
