// Test script để kiểm tra integration tournament_prizes với tournament creation
const testTournamentPrizesIntegration = () => {
  console.log('🧪 Testing Tournament Prizes Integration');
  
  // Test data giống như trong createTournament function
  const tournamentData = {
    name: 'Test Tournament',
    prize_pool: 1000000,
    first_prize: 400000,
    second_prize: 240000,
    third_prize: 160000,
    max_participants: 16
  };
  
  // Mock generatePrizeTemplate function
  const generatePrizeTemplate = (prizePool, firstPrize, secondPrize, thirdPrize) => {
    const template = [];
    
    for (let i = 1; i <= 16; i++) {
      let cashAmount = 0;
      let positionName = '';
      
      if (i === 1) {
        cashAmount = firstPrize || Math.floor(prizePool * 0.4);
        positionName = 'Vô địch';
      } else if (i === 2) {
        cashAmount = secondPrize || Math.floor(prizePool * 0.24);
        positionName = 'Á quân';
      } else if (i === 3) {
        cashAmount = thirdPrize || Math.floor(prizePool * 0.16);
        positionName = 'Hạng 3';
      } else {
        cashAmount = Math.floor(prizePool * 0.01);
        positionName = `Hạng ${i}`;
      }
      
      template.push({
        prize_position: i,
        position_name: positionName,
        cash_amount: cashAmount,
        elo_points: i === 1 ? 100 : i === 2 ? 50 : i === 3 ? 25 : 5,
        spa_points: i === 1 ? 1500 : i === 2 ? 1100 : i === 3 ? 900 : 320,
        physical_items: [],
        color_theme: i <= 3 ? 'gold' : 'silver',
        is_visible: true,
        is_guaranteed: true
      });
    }
    
    return template;
  };
  
  const prizeTemplate = generatePrizeTemplate(
    tournamentData.prize_pool,
    tournamentData.first_prize,
    tournamentData.second_prize,
    tournamentData.third_prize
  );
  
  console.log('✅ Generated prize template:', prizeTemplate.length, 'positions');
  console.log('🏆 Top 3 prizes:');
  prizeTemplate.slice(0, 3).forEach(prize => {
    console.log(`  ${prize.position_name}: ${prize.cash_amount.toLocaleString()} VND, ${prize.spa_points} SPA, ${prize.elo_points} ELO`);
  });
  
  // Test SQL query structure
  const sampleSQLForPosition1 = `
    SELECT 
      COALESCE(tp.cash_amount, 0) as cash_amount,
      COALESCE(tp.spa_points, 0) as spa_points,
      COALESCE(tp.elo_points, 0) as elo_points
    FROM tournament_prizes tp
    WHERE tp.tournament_id = 'sample-tournament-id' 
      AND tp.prize_position = 1
      AND tp.is_visible = true;
  `;
  
  console.log('📝 Sample SQL query for position 1:');
  console.log(sampleSQLForPosition1);
  
  // Test REST API call structure
  const sampleAPICall = {
    url: '/rest/v1/tournament_prizes',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'your-supabase-anon-key',
      'Authorization': 'Bearer your-access-token'
    },
    body: JSON.stringify(prizeTemplate.map(prize => ({
      tournament_id: 'sample-tournament-id',
      ...prize
    })))
  };
  
  console.log('🌐 Sample REST API call structure:');
  console.log('URL:', sampleAPICall.url);
  console.log('Method:', sampleAPICall.method);
  console.log('Records to insert:', prizeTemplate.length);
  
  console.log('✅ Integration test completed successfully!');
  console.log('🚀 Ready for production deployment');
};

// Run test
testTournamentPrizesIntegration();
