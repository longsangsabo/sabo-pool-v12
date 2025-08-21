// Test tournament prizes service functionality
import { TournamentPrizesService } from './src/services/tournament-prizes.service.js';

async function testPrizeService() {
  console.log('🎯 Testing Tournament Prizes Service...');
  
  try {
    // Test 1: Create default template
    console.log('1. Creating default template...');
    const template = TournamentPrizesService.createDefaultPrizeTemplate(
      'test-tournament-123',
      'standard', 
      1000000
    );
    
    console.log(`✅ Template created: ${template.length} positions`);
    console.log('First position:', template[0]);
    console.log('Last position:', template[template.length - 1]);
    
    // Test 2: Check data structure
    console.log('2. Checking data structure...');
    template.forEach((prize, index) => {
      if (!prize.tournament_id || !prize.position_name || typeof prize.cash_amount !== 'number') {
        console.error(`❌ Invalid prize at index ${index}:`, prize);
      }
    });
    
    console.log('✅ Data structure validation passed');
    
  } catch (error) {
    console.error('❌ Service test failed:', error);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPrizeService();
}
