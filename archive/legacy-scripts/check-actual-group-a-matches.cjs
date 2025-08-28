const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkGroupAMatches() {
  console.log('🔍 Kiểm tra thực tế số trận trong Group A...\n');
  
  try {
    // Lấy tất cả matches của Group A
    const { data: matches, error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('group_id', 'A')
      .order('round_number', { ascending: true })
      .order('match_number', { ascending: true });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📊 TỔNG SỐ TRẬN GROUP A: ${matches.length}`);
    
    // Phân tích theo bracket_type
    const byBracketType = {};
    const byRound = {};
    
    matches.forEach(match => {
      // Group by bracket type
      if (!byBracketType[match.bracket_type]) {
        byBracketType[match.bracket_type] = [];
      }
      byBracketType[match.bracket_type].push(match);
      
      // Group by round
      if (!byRound[match.round_number]) {
        byRound[match.round_number] = [];
      }
      byRound[match.round_number].push(match);
    });

    console.log('\n📋 PHÂN TÍCH THEO BRACKET TYPE:');
    Object.keys(byBracketType).forEach(bracketType => {
      console.log(`  ${bracketType}: ${byBracketType[bracketType].length} trận`);
    });

    console.log('\n🔢 PHÂN TÍCH THEO ROUND:');
    Object.keys(byRound).sort((a, b) => parseInt(a) - parseInt(b)).forEach(round => {
      console.log(`  Round ${round}: ${byRound[round].length} trận`);
    });

    console.log('\n🏗️ CẤU TRÚC LÝ THUYẾT (từ SABO32Structure.ts):');
    console.log('  Winners Bracket: 14 trận (8+4+2)');
    console.log('  Losers Branch A: 7 trận (4+2+1)');
    console.log('  Losers Branch B: 3 trận (2+1)');
    console.log('  Group Final: 1 trận');
    console.log('  TỔNG LÝ THUYẾT: 25 trận');

    console.log('\n❓ VẤN ĐỀ:');
    if (matches.length > 25) {
      console.log(`  🚨 Group A có ${matches.length} trận thay vì 25 trận theo thiết kế!`);
      console.log(`  🔍 Có thể có duplicate hoặc logic tạo trận bị sai`);
    } else if (matches.length < 25) {
      console.log(`  🚨 Group A thiếu ${25 - matches.length} trận!`);
    } else {
      console.log(`  ✅ Group A có đúng 25 trận theo thiết kế`);
    }

    // Chi tiết từng trận để debug
    console.log('\n📝 CHI TIẾT TỪNG TRẬN:');
    matches.forEach(match => {
      console.log(`  ${match.sabo_match_id} | ${match.bracket_type} | Round ${match.round_number} | Match ${match.match_number} | ${match.status}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkGroupAMatches();
