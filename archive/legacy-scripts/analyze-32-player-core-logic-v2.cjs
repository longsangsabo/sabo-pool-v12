const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

/**
 * Phân tích core logic của 32 player double elimination tournament
 * Cấu trúc chuẩn:
 * - 32 players chia thành 2 groups: A (16 players) và B (16 players)
 * - Mỗi group có Winners Bracket và Losers Bracket
 * - Winners Bracket: 15 matches để từ 16 players → 1 winner
 * - Losers Bracket: số matches khác nhau tùy theo cấu trúc
 * - Group Finals: 2 matches (1 cho mỗi group)
 * - Cross-Bracket Finals: 3 matches để quyết định champion
 */

async function analyzeCoreLogic() {
  console.log('🔍 PHÂN TÍCH CORE LOGIC 32 PLAYER TOURNAMENT');
  console.log('='.repeat(60));

  try {
    // Lấy tất cả matches
    const { data: matches, error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .order('sabo_match_id');

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }

    console.log(`📊 Tổng số matches: ${matches.length}`);
    console.log();

    // Phân tích theo bracket_type và group
    const analysis = {};
    
    matches.forEach(match => {
      const key = `${match.group_id}_${match.bracket_type}`;
      if (!analysis[key]) {
        analysis[key] = [];
      }
      analysis[key].push(match);
    });

    // Hiển thị phân tích chi tiết
    console.log('📋 PHÂN TÍCH CHI TIẾT THEO BRACKET:');
    console.log('-'.repeat(50));

    Object.keys(analysis).sort().forEach(key => {
      const matches = analysis[key];
      const [group, bracket] = key.split('_');
      console.log(`${group} ${bracket}: ${matches.length} matches`);
      
      // Hiển thị rounds
      const rounds = {};
      matches.forEach(match => {
        if (!rounds[match.round]) {
          rounds[match.round] = 0;
        }
        rounds[match.round]++;
      });
      
      Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b)).forEach(round => {
        console.log(`  Round ${round}: ${rounds[round]} matches`);
      });
      console.log();
    });

    // Tính toán lý thuyết cho 32 player tournament
    console.log('🧮 TÍNH TOÁN LY THUYẾT:');
    console.log('-'.repeat(30));
    console.log('Winners Bracket (16 players → 1 winner):');
    console.log('  Round 1: 8 matches (16→8)');
    console.log('  Round 2: 4 matches (8→4)'); 
    console.log('  Round 3: 2 matches (4→2)');
    console.log('  Round 4: 1 match (2→1)');
    console.log('  Total Winners: 15 matches');
    console.log();
    
    console.log('Losers Bracket (15 losers từ Winners + reset từ Winners Final):');
    console.log('  Cần tính toán cụ thể dựa trên cấu trúc double elimination');
    console.log();

    // Kiểm tra tính hợp lệ
    console.log('✅ KIỂM TRA TÍNH HỢP LỆ:');
    console.log('-'.repeat(30));
    
    const groupA = matches.filter(m => m.group_id === 'A');
    const groupB = matches.filter(m => m.group_id === 'B');
    const crossBracket = matches.filter(m => m.group_id === 'Cross-Bracket');
    
    console.log(`Group A: ${groupA.length} matches`);
    console.log(`Group B: ${groupB.length} matches`);
    console.log(`Cross-Bracket: ${crossBracket.length} matches`);
    console.log();

    // Phân tích Winners vs Losers trong mỗi group
    const groupAWinners = groupA.filter(m => m.bracket_type === 'Winners');
    const groupALosers = groupA.filter(m => m.bracket_type === 'Losers');
    const groupAFinal = groupA.filter(m => m.bracket_type === 'Final');
    
    const groupBWinners = groupB.filter(m => m.bracket_type === 'Winners');
    const groupBLosers = groupB.filter(m => m.bracket_type === 'Losers');
    const groupBFinal = groupB.filter(m => m.bracket_type === 'Final');

    console.log('📊 PHÂN TÍCH CHI TIẾT TỪNG GROUP:');
    console.log('-'.repeat(40));
    console.log(`Group A Winners: ${groupAWinners.length} matches`);
    console.log(`Group A Losers: ${groupALosers.length} matches`);
    console.log(`Group A Final: ${groupAFinal.length} matches`);
    console.log(`➡️  Total Group A: ${groupA.length} matches`);
    console.log();
    
    console.log(`Group B Winners: ${groupBWinners.length} matches`);
    console.log(`Group B Losers: ${groupBLosers.length} matches`);
    console.log(`Group B Final: ${groupBFinal.length} matches`);
    console.log(`➡️  Total Group B: ${groupB.length} matches`);
    console.log();

    // Tính toán chuẩn cho 16 players double elimination
    console.log('🎯 CHUẨN CHO 16 PLAYERS DOUBLE ELIMINATION:');
    console.log('-'.repeat(45));
    console.log('Winners Bracket: 15 matches (16→8→4→2→1)');
    console.log('Losers Bracket: 11 matches');
    console.log('  - Round 1: 4 matches (8 losers từ Winners R1)');
    console.log('  - Round 2: 2 matches (4 winners R1 + 4 losers từ Winners R2)');
    console.log('  - Round 3: 2 matches (2 winners R2 + 2 losers từ Winners R3)');
    console.log('  - Round 4: 1 match (1 winner R3 + 1 loser từ Winners R4)');
    console.log('  - Round 5: 1 match (Losers Final)');
    console.log('  - Round 6: 1 match (nếu Losers champion thắng Winners champion)');
    console.log('Group Final: 1 match (Winners champion vs Losers champion)');
    console.log('Total per group: 27 matches (15+11+1)');
    console.log();
    console.log('❌ NHƯNG THỰC TẾ Group A có:', groupA.length, 'matches');
    console.log('❌ NHƯNG THỰC TẾ Group B có:', groupB.length, 'matches');
    
    if (groupA.length !== 26 || groupB.length !== 26) {
      console.log();
      console.log('🚨 CÓ VẤN ĐỀ VỚI SỐ LƯỢNG MATCHES!');
      console.log('Chuẩn: mỗi group cần 26 matches (15 Winners + 10 Losers + 1 Final)');
      console.log('Không phải 27 matches như hiện tại!');
    }

  } catch (error) {
    console.error('Error in analysis:', error);
  }
}

analyzeCoreLogic();
