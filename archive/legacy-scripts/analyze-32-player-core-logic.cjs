const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeCoreLogic() {
  console.log('=== PHÂN TÍCH CORE LOGIC 32 PLAYER TOURNAMENT ===\n');

  // Lấy tất cả matches
  const { data: matches, error } = await supabase
    .from('sabo32_matches')
    .select('*')
    .order('match_number');

  if (error) {
    console.error('Lỗi:', error);
    return;
  }

  console.log('TỔNG SỐ TRẬN:', matches.length);
  console.log();

  // Phân tích theo tournament_group
  const byGroup = {};
  matches.forEach(match => {
    if (!byGroup[match.tournament_group]) {
      byGroup[match.tournament_group] = [];
    }
    byGroup[match.tournament_group].push(match);
  });

  console.log('=== PHÂN TÍCH THEO GROUP ===');
  Object.keys(byGroup).sort().forEach(group => {
    console.log(`Group ${group}: ${byGroup[group].length} trận`);
  });
  console.log();

  // Phân tích chi tiết từng group
  ['A', 'B'].forEach(group => {
    console.log(`=== CHI TIẾT GROUP ${group} ===`);
    const groupMatches = byGroup[group] || [];
    
    // Phân loại theo bracket_type
    const byBracket = {};
    groupMatches.forEach(match => {
      if (!byBracket[match.bracket_type]) {
        byBracket[match.bracket_type] = [];
      }
      byBracket[match.bracket_type].push(match);
    });

    Object.keys(byBracket).sort().forEach(bracketType => {
      console.log(`  ${bracketType}: ${byBracket[bracketType].length} trận`);
      
      // Phân tích theo round
      const byRound = {};
      byBracket[bracketType].forEach(match => {
        if (!byRound[match.round_number]) {
          byRound[match.round_number] = [];
        }
        byRound[match.round_number].push(match);
      });

      Object.keys(byRound).sort((a, b) => parseInt(a) - parseInt(b)).forEach(round => {
        console.log(`    Round ${round}: ${byRound[round].length} trận`);
      });
    });
    console.log();
  });

  // Kiểm tra Cross-Bracket
  const crossBracket = byGroup['Cross-Bracket'] || [];
  console.log('=== CROSS-BRACKET ===');
  console.log(`Số trận: ${crossBracket.length}`);
  crossBracket.forEach(match => {
    console.log(`  Match ${match.match_number}: ${match.match_type} (Round ${match.round_number})`);
  });
  console.log();

  // CORE LOGIC CHECK
  console.log('=== KIỂM TRA CORE LOGIC 32 PLAYER ===');
  console.log('Theo tiêu chuẩn Double Elimination Tournament cho 32 người:');
  console.log();
  
  console.log('OPTION 1: Chia 2 group 16 người');
  console.log('- Mỗi group 16 người cần:');
  console.log('  + Winners Bracket: 15 trận (16→8→4→2→1)');
  console.log('  + Losers Bracket: 11 trận');
  console.log('  + Group Final: 1 trận');
  console.log('  = Tổng mỗi group: 27 trận');
  console.log('- 2 groups: 27 × 2 = 54 trận');
  console.log('- Cross-Bracket Final: 1 trận');
  console.log('- TỔNG: 55 trận');
  console.log();

  console.log('OPTION 2: Single bracket 32 người');
  console.log('- Winners Bracket: 31 trận (32→16→8→4→2→1)');
  console.log('- Losers Bracket: 30 trận');
  console.log('- Grand Final: 1 trận');
  console.log('- TỔNG: 62 trận');
  console.log();

  console.log('HIỆN TẠI TRONG DATABASE:');
  console.log(`- Group A: ${byGroup['A']?.length || 0} trận`);
  console.log(`- Group B: ${byGroup['B']?.length || 0} trận`);
  console.log(`- Cross-Bracket: ${byGroup['Cross-Bracket']?.length || 0} trận`);
  console.log(`- TỔNG: ${matches.length} trận`);
  console.log();

  // Kiểm tra từng group có đúng logic không
  ['A', 'B'].forEach(group => {
    const groupMatches = byGroup[group] || [];
    const byBracket = {};
    groupMatches.forEach(match => {
      if (!byBracket[match.bracket_type]) {
        byBracket[match.bracket_type] = [];
      }
      byBracket[match.bracket_type].push(match);
    });

    console.log(`=== KIỂM TRA LOGIC GROUP ${group} ===`);
    console.log(`Winners Bracket: ${byBracket['Winners']?.length || 0} trận (cần 15)`);
    console.log(`Losers Bracket: ${byBracket['Losers']?.length || 0} trận (cần 11)`);
    console.log(`Group Final: ${byBracket['Group Final']?.length || 0} trận (cần 1)`);
    
    const total = (byBracket['Winners']?.length || 0) + 
                  (byBracket['Losers']?.length || 0) + 
                  (byBracket['Group Final']?.length || 0);
    
    console.log(`Tổng: ${total} trận (cần 27)`);
    
    if (total !== 27) {
      console.log(`❌ KHÔNG ĐÚNG! Group ${group} thiếu/thừa ${27 - total} trận`);
    } else {
      console.log(`✅ ĐÚNG! Group ${group} có đủ 27 trận`);
    }
    console.log();
  });
}

analyzeCoreLogic().catch(console.error);
