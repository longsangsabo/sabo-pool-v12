require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function findActiveTournaments() {
  console.log('🔍 TÌM KIẾM TẤT CẢ TOURNAMENTS');
  
  try {
    // Lấy tất cả tournaments
    const { data: allTournaments, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Lỗi:', error);
      return;
    }

    console.log(`📊 Tổng số tournaments: ${allTournaments?.length || 0}`);
    
    if (allTournaments?.length) {
      console.log('\n📋 10 TOURNAMENTS GẦN NHẤT:');
      allTournaments.forEach((t, i) => {
        console.log(`${i+1}. ID: ${t.id}`);
        console.log(`   Name: ${t.name}`);
        console.log(`   Type: ${t.tournament_type}`);
        console.log(`   Status: ${t.status}`);
        console.log(`   Created: ${t.created_at}`);
        console.log('');
      });

      // Tìm SABO-32 tournaments
      const sabo32Tournaments = allTournaments.filter(t => t.tournament_type === 'SABO_32');
      if (sabo32Tournaments.length > 0) {
        console.log('\n🎯 SABO-32 TOURNAMENTS:');
        sabo32Tournaments.forEach((t, i) => {
          console.log(`${i+1}. ${t.name} - Status: ${t.status} - ID: ${t.id}`);
        });

        // Chọn tournament gần nhất để phân tích
        const latestSabo32 = sabo32Tournaments[0];
        console.log(`\n🎯 PHÂN TÍCH TOURNAMENT: ${latestSabo32.name}`);
        await analyzeSpecificTournament(latestSabo32.id);
      } else {
        console.log('\n❌ Không tìm thấy SABO-32 tournaments');
      }
    } else {
      console.log('❌ Không tìm thấy tournaments nào');
    }

  } catch (error) {
    console.error('❌ Lỗi tổng quát:', error);
  }
}

async function analyzeSpecificTournament(tournamentId) {
  try {
    // Lấy matches của tournament này
    const { data: matches, error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order(['bracket_type', 'round_number', 'match_number']);

    if (error) {
      console.error('❌ Lỗi lấy matches:', error);
      return;
    }

    if (!matches?.length) {
      console.log('❌ Không có matches cho tournament này');
      return;
    }

    console.log(`📊 Tournament có ${matches.length} matches`);

    // Nhóm theo bracket type
    const bracketTypes = [...new Set(matches.map(m => m.bracket_type))];
    console.log(`🏷️ Bracket types: ${bracketTypes.join(', ')}`);

    // Phân tích Group Finals
    const groupAFinals = matches.filter(m => m.bracket_type === 'GROUP_A_FINAL');
    const groupBFinals = matches.filter(m => m.bracket_type === 'GROUP_B_FINAL');

    console.log(`\n🏆 GROUP A FINALS: ${groupAFinals.length} matches`);
    groupAFinals.forEach(m => {
      console.log(`  ${m.sabo_match_id}: ${m.status}`);
      console.log(`  Player1: ${m.player1_id || 'TBD'}`);
      console.log(`  Player2: ${m.player2_id || 'TBD'}`);
      console.log(`  Player3: ${m.player3_id || 'TBD'}`);
      console.log(`  Player4: ${m.player4_id || 'TBD'}`);
      console.log(`  Winner: ${m.winner_id || 'TBD'}`);
      console.log('');
    });

    console.log(`🏆 GROUP B FINALS: ${groupBFinals.length} matches`);
    groupBFinals.forEach(m => {
      console.log(`  ${m.sabo_match_id}: ${m.status}`);
      console.log(`  Player1: ${m.player1_id || 'TBD'}`);
      console.log(`  Player2: ${m.player2_id || 'TBD'}`);
      console.log(`  Player3: ${m.player3_id || 'TBD'}`);
      console.log(`  Player4: ${m.player4_id || 'TBD'}`);
      console.log(`  Winner: ${m.winner_id || 'TBD'}`);
      console.log('');
    });

    // Kiểm tra matches đã completed để tìm candidates
    console.log('\n🔍 KIỂM TRA ADVANCEMENT CANDIDATES:');
    
    // Group A
    await checkAdvancementCandidates(matches, 'A', tournamentId);
    
    // Group B  
    await checkAdvancementCandidates(matches, 'B', tournamentId);

  } catch (error) {
    console.error('❌ Lỗi phân tích tournament:', error);
  }
}

async function checkAdvancementCandidates(allMatches, group, tournamentId) {
  const groupPrefix = `GROUP_${group}`;
  
  console.log(`\n🅰️ GROUP ${group} ADVANCEMENT CHECK:`);
  
  // Lọc matches theo group
  const winners = allMatches.filter(m => m.bracket_type === `${groupPrefix}_WINNERS`);
  const losersA = allMatches.filter(m => m.bracket_type === `${groupPrefix}_LOSERS_A`);
  const losersB = allMatches.filter(m => m.bracket_type === `${groupPrefix}_LOSERS_B`);
  const finals = allMatches.filter(m => m.bracket_type === `${groupPrefix}_FINAL`);

  // Tìm completed matches
  const completedWinners = winners.filter(m => m.status === 'completed' && m.winner_id);
  const completedLosersA = losersA.filter(m => m.status === 'completed' && m.winner_id);
  const completedLosersB = losersB.filter(m => m.status === 'completed' && m.winner_id);

  console.log(`📈 Winners Bracket: ${completedWinners.length}/${winners.length} completed`);
  completedWinners.forEach(m => {
    console.log(`   ${m.sabo_match_id} (Round ${m.round_number}): Winner ${m.winner_id}`);
  });

  console.log(`📉 Losers A: ${completedLosersA.length}/${losersA.length} completed`);
  completedLosersA.forEach(m => {
    console.log(`   ${m.sabo_match_id} (Round ${m.round_number}): Winner ${m.winner_id}`);
  });

  console.log(`📉 Losers B: ${completedLosersB.length}/${losersB.length} completed`);
  completedLosersB.forEach(m => {
    console.log(`   ${m.sabo_match_id} (Round ${m.round_number}): Winner ${m.winner_id}`);
  });

  // Logic advancement: cần ít nhất 2 từ Winners, 1 từ Losers A, 1 từ Losers B
  if (completedWinners.length >= 2 && completedLosersA.length >= 1 && completedLosersB.length >= 1) {
    console.log('✅ ĐỦ ĐIỀU KIỆN ADVANCE VÀO GROUP FINAL!');
    
    // Tìm candidates cụ thể
    const candidatesForGroupFinal = findGroupFinalCandidates(completedWinners, completedLosersA, completedLosersB);
    
    console.log('\n🎯 4 CANDIDATES CHO GROUP FINAL:');
    candidatesForGroupFinal.forEach((candidate, i) => {
      console.log(`${i+1}. ${candidate.playerId} (từ ${candidate.source})`);
    });

    // Kiểm tra Group Final hiện tại
    if (finals.length > 0) {
      const groupFinal = finals[0];
      console.log(`\n🏆 TRẠNG THÁI GROUP FINAL HIỆN TẠI:`);
      console.log(`   Match ID: ${groupFinal.sabo_match_id}`);
      console.log(`   Status: ${groupFinal.status}`);
      console.log(`   Player1: ${groupFinal.player1_id || 'EMPTY'}`);
      console.log(`   Player2: ${groupFinal.player2_id || 'EMPTY'}`);
      console.log(`   Player3: ${groupFinal.player3_id || 'EMPTY'}`);
      console.log(`   Player4: ${groupFinal.player4_id || 'EMPTY'}`);

      if (!groupFinal.player1_id || !groupFinal.player2_id || !groupFinal.player3_id || !groupFinal.player4_id) {
        console.log('\n⚠️ VẤN ĐỀ: Group Final chưa đầy đủ 4 players!');
        console.log('🔧 CẦN UPDATE GROUP FINAL:');
        
        const updateSQL = `
UPDATE sabo32_matches 
SET 
  player1_id = '${candidatesForGroupFinal[0]?.playerId || 'NULL'}',
  player2_id = '${candidatesForGroupFinal[1]?.playerId || 'NULL'}',
  player3_id = '${candidatesForGroupFinal[2]?.playerId || 'NULL'}',
  player4_id = '${candidatesForGroupFinal[3]?.playerId || 'NULL'}',
  status = 'pending'
WHERE 
  tournament_id = '${tournamentId}' 
  AND bracket_type = 'GROUP_${group}_FINAL'
  AND sabo_match_id = '${groupFinal.sabo_match_id}';`;
        
        console.log(updateSQL);
      } else {
        console.log('✅ Group Final đã có đầy đủ 4 players');
      }
    } else {
      console.log('❌ Không tìm thấy Group Final match!');
    }
  } else {
    console.log('❌ CHƯA ĐỦ ĐIỀU KIỆN ADVANCE');
    console.log(`   Cần: 2 từ Winners (có ${completedWinners.length}), 1 từ Losers A (có ${completedLosersA.length}), 1 từ Losers B (có ${completedLosersB.length})`);
  }
}

function findGroupFinalCandidates(winnersMatches, losersAMatches, losersBMatches) {
  const candidates = [];

  // Lấy 2 người từ Winners bracket (2 round cuối cùng)
  const maxWinnersRound = Math.max(...winnersMatches.map(m => m.round_number));
  const winnersFinalists = winnersMatches.filter(m => m.round_number === maxWinnersRound);
  
  winnersFinalists.slice(0, 2).forEach(m => {
    candidates.push({
      playerId: m.winner_id,
      source: `Winners ${m.sabo_match_id}`
    });
  });

  // Lấy 1 người từ Losers A (round cuối cùng)
  const maxLosersARound = Math.max(...losersAMatches.map(m => m.round_number));
  const losersAFinal = losersAMatches.filter(m => m.round_number === maxLosersARound);
  
  if (losersAFinal.length > 0) {
    candidates.push({
      playerId: losersAFinal[0].winner_id,
      source: `Losers A ${losersAFinal[0].sabo_match_id}`
    });
  }

  // Lấy 1 người từ Losers B (round cuối cùng)
  const maxLosersBRound = Math.max(...losersBMatches.map(m => m.round_number));
  const losersBFinal = losersBMatches.filter(m => m.round_number === maxLosersBRound);
  
  if (losersBFinal.length > 0) {
    candidates.push({
      playerId: losersBFinal[0].winner_id,
      source: `Losers B ${losersBFinal[0].sabo_match_id}`
    });
  }

  return candidates;
}

// Chạy script
findActiveTournaments().catch(console.error);
