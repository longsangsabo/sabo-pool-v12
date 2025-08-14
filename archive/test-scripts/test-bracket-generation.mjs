import { ClientSideDoubleElimination } from './src/services/ClientSideDoubleElimination.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Testing SABO Double Elimination Bracket Generator...\n');

// Test with tournament that has 16 players
const tournamentId = 'adced892-a39f-483f-871e-aa0102735219';

async function testBracketGeneration() {
  try {
    const generator = new ClientSideDoubleElimination(tournamentId);
    
    console.log('📋 Step 1: Generating bracket...');
    const result = await generator.generateBracket();
    
    if (result.success) {
      console.log('✅ SUCCESS: Bracket generated successfully!');
      console.log(`📊 Created ${result.matchCount} matches`);
      console.log(`👥 Players: ${result.playerCount}`);
      console.log('🎯 First few matches:');
      result.matches?.slice(0, 3).forEach((match, i) => {
        console.log(`  ${i+1}. Round ${match.round_number} Match ${match.match_number}: ${match.player1_id} vs ${match.player2_id}`);
      });
    } else {
      console.log('❌ FAILED: Bracket generation failed');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('🚨 Exception:', error);
  }
}

testBracketGeneration();
