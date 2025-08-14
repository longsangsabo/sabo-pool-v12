import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function diagnoseBracketIssue() {
  console.log('🔍 CHẨN ĐOÁN VẤN ĐỀ BRACKET MỚI TẠO');
  console.log('=====================================\n');
  
  // Tìm tournament mới nhất
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);
    
  console.log(`📋 ${tournaments.length} tournaments gần nhất:`);
  tournaments.forEach((t, i) => {
    console.log(`${i + 1}. ${t.name} (${t.tournament_type}) - Status: ${t.status}`);
    console.log(`   ID: ${t.id}`);
    console.log(`   Created: ${new Date(t.created_at).toLocaleString()}\n`);
  });
  
  // Chọn tournament mới nhất để kiểm tra
  const latestTournament = tournaments[0];
  console.log(`🎯 Kiểm tra tournament: "${latestTournament.name}"`);
  
  // Kiểm tra matches
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', latestTournament.id)
    .order('round_number')
    .order('match_number');
    
  console.log(`\n📊 MATCHES ANALYSIS:`);
  console.log(`Total matches: ${matches?.length || 0}`);
  
  if (!matches || matches.length === 0) {
    console.log('❌ PROBLEM: Không có matches nào được tạo!');
    console.log('\n🔧 SOLUTIONS:');
    console.log('1. Bracket generation function không chạy');
    console.log('2. Tournament type không được nhận diện đúng');
    console.log('3. Players chưa được assign vào tournament');
    
    // Kiểm tra players
    const { data: registrations } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('tournament_id', latestTournament.id);
      
    console.log(`\n👥 Tournament có ${registrations?.length || 0} players đăng ký`);
    
    if (!registrations || registrations.length === 0) {
      console.log('❌ PROBLEM: Tournament chưa có players!');
      console.log('💡 FIX: Cần add players vào tournament trước khi generate bracket');
    } else {
      console.log('✅ Tournament có players, vấn đề ở bracket generation');
    }
    
    return;
  }
  
  // Phân tích matches theo round
  const roundAnalysis = {};
  matches.forEach(match => {
    const round = match.round_number;
    if (!roundAnalysis[round]) {
      roundAnalysis[round] = {
        total: 0,
        with_players: 0,
        ready: 0,
        completed: 0
      };
    }
    
    roundAnalysis[round].total++;
    if (match.player1_id && match.player2_id) roundAnalysis[round].with_players++;
    if (match.status === 'ready') roundAnalysis[round].ready++;
    if (match.status === 'completed') roundAnalysis[round].completed++;
  });
  
  console.log('\n📊 ROUNDS BREAKDOWN:');
  Object.keys(roundAnalysis).forEach(round => {
    const stats = roundAnalysis[round];
    console.log(`Round ${round}: ${stats.total} matches, ${stats.with_players} have players, ${stats.ready} ready, ${stats.completed} completed`);
  });
  
  // Kiểm tra SABO specific rounds
  if (latestTournament.tournament_type === 'double_elimination') {
    console.log('\n🎯 SABO DOUBLE ELIMINATION CHECK:');
    
    const saboRounds = [1, 2, 3, 101, 102, 103, 201, 202, 250, 300];
    const saboMatches = matches.filter(m => saboRounds.includes(m.round_number));
    
    console.log(`SABO matches: ${saboMatches.length}/${matches.length}`);
    
    if (saboMatches.length === 0) {
      console.log('❌ PROBLEM: Không có SABO rounds! Tournament có thể được tạo sai format');
    } else {
      console.log('✅ SABO rounds detected');
      
      // Check if round 1 has players
      const round1Matches = matches.filter(m => m.round_number === 1);
      const round1WithPlayers = round1Matches.filter(m => m.player1_id && m.player2_id);
      
      if (round1WithPlayers.length === 0) {
        console.log('❌ PROBLEM: Round 1 chưa có players assigned!');
        console.log('💡 FIX: Cần chạy initial player assignment');
      } else {
        console.log(`✅ Round 1: ${round1WithPlayers.length}/${round1Matches.length} matches có players`);
      }
    }
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (matches.length === 0) {
    console.log('🔧 1. Chạy bracket generation function');
    console.log('🔧 2. Kiểm tra tournament type và players');
  } else if (matches.filter(m => m.player1_id && m.player2_id).length === 0) {
    console.log('🔧 1. Assign players vào Round 1 matches');
    console.log('🔧 2. Update match status thành "ready"');
  } else {
    console.log('✅ Bracket OK - UI có thể có vấn đề hiển thị');
  }
}

diagnoseBracketIssue();
