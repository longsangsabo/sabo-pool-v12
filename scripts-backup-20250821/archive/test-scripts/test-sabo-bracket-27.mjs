import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

console.log('🚀 Testing SABO Bracket Generation (27 matches)...\n');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';

async function testSABOBracketGeneration() {
  try {
    console.log('🧮 SABO Match Count Verification:');
    console.log('  🏆 Winner Bracket: 14 matches (8+4+2)');
    console.log('  🥈 Loser Branch A: 7 matches (4+2+1)');
    console.log('  🥈 Loser Branch B: 3 matches (2+1)');
    console.log('  🏅 Finals: 3 matches (2 semifinals + 1 final)');
    console.log('  📊 Total: 14+7+3+3 = 27 matches');
    console.log('');

    // Import and test the SABO bracket generator
    const { ClientSideDoubleElimination } = await import('./src/services/ClientSideDoubleElimination.js');
    
    console.log('📋 Testing with ClientSideDoubleElimination...');
    
    const generator = new ClientSideDoubleElimination(tournamentId);
    const result = await generator.generateBracket();
    
    if (result.success) {
      console.log('✅ SUCCESS: SABO bracket generated!');
      console.log(`📊 Generated ${result.matchCount} matches (expected: 27)`);
      console.log(`👥 Players: ${result.playerCount}`);
      
      if (result.matchCount === 27) {
        console.log('🎯 PERFECT: Match count is correct!');
      } else {
        console.log('⚠️ WARNING: Match count mismatch!');
      }
    } else {
      console.log('❌ FAILED: SABO bracket generation failed');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
  }
}

testSABOBracketGeneration();
