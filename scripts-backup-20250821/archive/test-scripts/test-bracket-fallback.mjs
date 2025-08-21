import { generateBracketFallback } from './src/utils/bracketFallback.ts';

async function testBracketFallback() {
  console.log('🧪 Testing bracket fallback function...');
  
  // Test với tournament ID thật
  const testTournamentId = '1c4f8eb1-4ac0-4531-bb47-de2a6a706f4f'; // Test Tournament for Club Management
  
  try {
    const result = await generateBracketFallback(testTournamentId, 'elo_based');
    
    if (result.success) {
      console.log('✅ Fallback bracket generation successful!');
      console.log('📊 Result:', result);
    } else {
      console.log('❌ Fallback failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testBracketFallback();
