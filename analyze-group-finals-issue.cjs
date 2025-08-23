require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Sử dụng service key để có quyền đầy đủ
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeGroupFinalsIssue() {
  console.log('🔍 PHÂN TÍCH VẤN ĐỀ GROUP FINALS SABO-32');
  
  try {
    // Tìm tournament SABO-32 đang active
    const { data: tournaments, error: tourError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('tournament_type', 'SABO_32')
      .eq('status', 'ongoing')
      .order('created_at', { ascending: false })
      .limit(1);

    if (tourError) {
      console.error('❌ Lỗi tournaments:', tourError);
      return;
    }

    if (!tournaments?.length) {
      console.log('❌ Không tìm thấy SABO-32 tournament đang active');
      
      // Kiểm tra tất cả tournaments
      const { data: allTournaments } = await supabase
        .from('tournaments')
        .select('*')
        .eq('tournament_type', 'SABO_32')
        .order('created_at', { ascending: false })
        .limit(5);
      
      console.log('\n📋 5 SABO-32 tournaments gần nhất:');
      allTournaments?.forEach(t => {
        console.log(`  ${t.id}: ${t.name} - Status: ${t.status} - Created: ${t.created_at}`);
      });
      return;
    }

    const tournament = tournaments[0];
    console.log(`🎯 Tournament: ${tournament.name} (ID: ${tournament.id})`);
    console.log(`📅 Status: ${tournament.status}`);

    // Lấy tất cả matches
    const { data: matches, error: matchError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournament.id)
      .order(['bracket_type', 'round_number', 'match_number']);

    if (matchError) {
      console.error('❌ Lỗi matches:', matchError);
      return;
    }

    if (!matches?.length) {
      console.log('❌ Không tìm thấy matches cho tournament này');
      return;
    }

    console.log(`📊 Tổng số matches: ${matches.length}`);

    // Phân tích theo bracket type
    const bracketTypes = [...new Set(matches.map(m => m.bracket_type))];
    console.log(`\n🏷️ Các bracket types: ${bracketTypes.join(', ')}`);

    // Phân tích chi tiết Group A
    console.log('\n🅰️ === GROUP A DETAILED ANALYSIS ===');
    await analyzeGroupDetailed(matches, 'A', tournament.id);

    // Phân tích chi tiết Group B  
    console.log('\n🅱️ === GROUP B DETAILED ANALYSIS ===');
    await analyzeGroupDetailed(matches, 'B', tournament.id);

  } catch (error) {
    console.error('❌ Lỗi tổng quát:', error);
  }
}

async function analyzeGroupDetailed(allMatches, group, tournamentId) {
  const groupPrefix = `GROUP_${group}`;
  
  // Lọc matches theo group
  const groupMatches = allMatches.filter(m => m.bracket_type.startsWith(groupPrefix));
  console.log(`📊 Group ${group} có ${groupMatches.length} matches`);

  // Phân loại matches
  const winners = groupMatches.filter(m => m.bracket_type === `${groupPrefix}_WINNERS`);
  const losersA = groupMatches.filter(m => m.bracket_type === `${groupPrefix}_LOSERS_A`);
  const losersB = groupMatches.filter(m => m.bracket_type === `${groupPrefix}_LOSERS_B`);
  const finals = groupMatches.filter(m => m.bracket_type === `${groupPrefix}_FINAL`);

  console.log(`\n📈 Winners Bracket: ${winners.length} matches`);
  winners.forEach((m, i) => {
    console.log(`  ${i+1}. ${m.sabo_match_id} (Round ${m.round_number}): ${m.status}`);
    console.log(`     ${m.player1_id || 'TBD'} vs ${m.player2_id || 'TBD'} → Winner: ${m.winner_id || 'TBD'}`);
  });

  console.log(`\n📉 Losers A: ${losersA.length} matches`);
  losersA.forEach((m, i) => {
    console.log(`  ${i+1}. ${m.sabo_match_id} (Round ${m.round_number}): ${m.status}`);
    console.log(`     ${m.player1_id || 'TBD'} vs ${m.player2_id || 'TBD'} → Winner: ${m.winner_id || 'TBD'}`);
  });

  console.log(`\n📉 Losers B: ${losersB.length} matches`);
  losersB.forEach((m, i) => {
    console.log(`  ${i+1}. ${m.sabo_match_id} (Round ${m.round_number}): ${m.status}`);
    console.log(`     ${m.player1_id || 'TBD'} vs ${m.player2_id || 'TBD'} → Winner: ${m.winner_id || 'TBD'}`);
  });

  console.log(`\n🏆 Group Finals: ${finals.length} matches`);
  finals.forEach((m, i) => {
    console.log(`  ${i+1}. ${m.sabo_match_id}: ${m.status}`);
    console.log(`     ${m.player1_id || 'TBD'} vs ${m.player2_id || 'TBD'} → Winner: ${m.winner_id || 'TBD'}`);
  });

  // Kiểm tra điều kiện advancement
  console.log(`\n🔍 KIỂM TRA ĐIỀU KIỆN ADVANCEMENT GROUP ${group}:`);
  
  // Tìm những matches cuối cùng đã completed
  const completedWinners = winners.filter(m => m.status === 'completed' && m.winner_id);
  const completedLosersA = losersA.filter(m => m.status === 'completed' && m.winner_id);
  const completedLosersB = losersB.filter(m => m.status === 'completed' && m.winner_id);

  console.log(`✅ Completed Winners: ${completedWinners.length}/${winners.length}`);
  console.log(`✅ Completed Losers A: ${completedLosersA.length}/${losersA.length}`);
  console.log(`✅ Completed Losers B: ${completedLosersB.length}/${losersB.length}`);

  // Logic advancement: Cần 2 từ Winners, 1 từ Losers A, 1 từ Losers B
  if (completedWinners.length >= 2 && completedLosersA.length >= 1 && completedLosersB.length >= 1) {
    console.log('🎯 ĐỦ ĐIỀU KIỆN ADVANCE VÀO GROUP FINAL!');
    
    // Tìm 2 người cuối cùng từ Winners bracket (highest round)
    const maxWinnersRound = Math.max(...completedWinners.map(m => m.round_number));
    const winnersFinalists = completedWinners.filter(m => m.round_number === maxWinnersRound);
    
    // 1 người từ Losers A (highest round)
    const maxLosersARound = Math.max(...completedLosersA.map(m => m.round_number));
    const losersAWinner = completedLosersA.filter(m => m.round_number === maxLosersARound);
    
    // 1 người từ Losers B (highest round)
    const maxLosersBRound = Math.max(...completedLosersB.map(m => m.round_number));
    const losersBWinner = completedLosersB.filter(m => m.round_number === maxLosersBRound);

    console.log('\n🏆 4 NGƯỜI CẦN ADVANCE VÀO GROUP FINAL:');
    console.log(`  Winners Bracket (${winnersFinalists.length}):`);
    winnersFinalists.forEach(m => console.log(`    - ${m.winner_id} (từ ${m.sabo_match_id})`));
    
    console.log(`  Losers A Winner (${losersAWinner.length}):`);
    losersAWinner.forEach(m => console.log(`    - ${m.winner_id} (từ ${m.sabo_match_id})`));
    
    console.log(`  Losers B Winner (${losersBWinner.length}):`);
    losersBWinner.forEach(m => console.log(`    - ${m.winner_id} (từ ${m.sabo_match_id})`));

    // Kiểm tra xem Group Final đã có players chưa
    if (finals.length > 0) {
      const groupFinal = finals[0];
      if (!groupFinal.player1_id && !groupFinal.player2_id) {
        console.log('\n⚠️ VẤN ĐỀ: Group Final chưa có players được assign!');
        console.log('🔧 CẦN CHẠY LOGIC ADVANCEMENT ĐỂ POPULATE GROUP FINAL');
        
        // Đề xuất giải pháp
        await suggestFix(group, winnersFinalists, losersAWinner, losersBWinner, groupFinal, tournamentId);
      } else {
        console.log('✅ Group Final đã có players được assign');
      }
    } else {
      console.log('⚠️ VẤN ĐỀ: Không tìm thấy Group Final match!');
    }
  } else {
    console.log('❌ CHƯA ĐỦ ĐIỀU KIỆN ADVANCE VÀO GROUP FINAL');
    console.log(`   Cần: 2 từ Winners (có ${completedWinners.length}), 1 từ Losers A (có ${completedLosersA.length}), 1 từ Losers B (có ${completedLosersB.length})`);
  }
}

async function suggestFix(group, winnersFinalists, losersAWinner, losersBWinner, groupFinal, tournamentId) {
  console.log(`\n🔧 ĐỀ XUẤT GIẢI PHÁP CHO GROUP ${group}:`);
  
  const allQualifiers = [
    ...winnersFinalists.map(m => m.winner_id),
    ...losersAWinner.map(m => m.winner_id),
    ...losersBWinner.map(m => m.winner_id)
  ];

  console.log(`📝 SQL để fix Group ${group} Final:`);
  console.log(`UPDATE sabo32_matches 
SET 
  player1_id = '${allQualifiers[0] || 'PLAYER_1_ID'}',
  player2_id = '${allQualifiers[1] || 'PLAYER_2_ID'}',
  player3_id = '${allQualifiers[2] || 'PLAYER_3_ID'}', 
  player4_id = '${allQualifiers[3] || 'PLAYER_4_ID'}',
  status = 'pending'
WHERE 
  tournament_id = '${tournamentId}' 
  AND bracket_type = 'GROUP_${group}_FINAL'
  AND sabo_match_id = '${groupFinal.sabo_match_id}';`);
}

// Chạy phân tích
analyzeGroupFinalsIssue().catch(console.error);
