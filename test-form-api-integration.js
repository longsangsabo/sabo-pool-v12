// Test tournament creation via API to check if prizes come from form
const testTournamentWithFormPrizes = async () => {
  console.log('🧪 TESTING TOURNAMENT CREATION WITH FORM PRIZES');
  console.log('=' .repeat(60));

  const apiUrl = 'http://localhost:8000/api/tournaments';
  
  // Mock tournament data (giống như form gửi)
  const tournamentData = {
    name: "TEST - Form Prizes Integration",
    description: "Testing if prizes come from UnifiedPrizesManager component",
    tournament_type: "double_elimination",
    tournament_start: "2025-01-20 10:00:00",
    tournament_end: "2025-01-20 18:00:00", 
    registration_start: "2025-01-15 00:00:00",
    registration_end: "2025-01-19 23:59:59",
    max_participants: 16,
    current_participants: 0,
    
    // Prize information
    prize_pool: 2000000, // 2M VND
    first_prize: 800000,  // 40% - như UnifiedPrizesManager tính
    second_prize: 480000, // 24% 
    third_prize: 320000,  // 16%
    entry_fee: 150000,
    
    // Tournament config
    is_public: true,
    requires_approval: false,
    allow_all_ranks: true,
    venue_name: "SABO Test Center - Form Prizes",
    
    // Admin info
    organizer_id: "550e8400-e29b-41d4-a716-446655440000",
    contact_person: "Test Admin",
    contact_phone: "0901234567"
  };

  console.log('📊 Tournament Data to Submit:');
  console.log('- Name:', tournamentData.name);
  console.log('- Prize Pool:', tournamentData.prize_pool.toLocaleString(), 'VND');
  console.log('- First Prize:', tournamentData.first_prize.toLocaleString(), 'VND (40%)');
  console.log('- Second Prize:', tournamentData.second_prize.toLocaleString(), 'VND (24%)');
  console.log('- Third Prize:', tournamentData.third_prize.toLocaleString(), 'VND (16%)');

  try {
    // 1. Create tournament
    console.log('\\n🚀 Step 1: Creating tournament...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZXJ0eXVpb3Bhc2RmZ2hqa2wiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzI4NDQ4MjcxLCJleHAiOjIwNDQwMjQyNzF9.rF6kIKM5Xg10lD2Lsb0lF5MHHUYhvJhAY9VGNTg7t-A'
      },
      body: JSON.stringify(tournamentData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    const tournamentId = result.data[0].id;
    
    console.log('✅ Tournament created successfully!');
    console.log('- Tournament ID:', tournamentId);
    console.log('- Name:', result.data[0].name);
    console.log('- Prize Pool:', result.data[0].prize_pool?.toLocaleString(), 'VND');

    // 2. Check tournament_prizes table
    console.log('\\n🏆 Step 2: Checking tournament_prizes table...');
    const prizesResponse = await fetch(`${apiUrl}/${tournamentId}/prizes`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZXJ0eXVpb3Bhc2RmZ2hqa2wiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzI4NDQ4MjcxLCJleHAiOjIwNDQwMjQyNzF9.rF6kIKM5Xg10lD2Lsb0lF5MHHUYhvJhAY9VGNTg7t-A'
      }
    });

    if (prizesResponse.ok) {
      const prizesData = await prizesResponse.json();
      console.log('✅ Found', prizesData.data?.length || 0, 'prize records');
      
      if (prizesData.data && prizesData.data.length > 0) {
        console.log('\\n🎯 Prize Analysis:');
        const topPrizes = prizesData.data.slice(0, 4);
        topPrizes.forEach(prize => {
          console.log(`- Position ${prize.prize_position}: ${prize.position_name} - ${prize.cash_amount?.toLocaleString() || 0} VND`);
        });

        // Check if prizes match form input (40/24/16% distribution)
        const firstPrizeCash = prizesData.data.find(p => p.prize_position === 1)?.cash_amount || 0;
        const expectedFirst = Math.floor(tournamentData.prize_pool * 0.4);
        
        console.log('\\n🔍 FORM PRIZES VALIDATION:');
        console.log('- Expected 1st prize (40%):', expectedFirst.toLocaleString(), 'VND');
        console.log('- Actual 1st prize:', firstPrizeCash.toLocaleString(), 'VND');
        
        if (firstPrizeCash === expectedFirst) {
          console.log('✅ SUCCESS: Prizes match UnifiedPrizesManager calculations!');
        } else if (firstPrizeCash === tournamentData.first_prize) {
          console.log('✅ SUCCESS: Prizes match form input values!');
        } else {
          console.log('❌ WARNING: Prizes do not match expected values');
          console.log('   This suggests fallback logic was used instead of form data');
        }
      }
    } else {
      console.log('❌ Could not fetch prizes data');
    }

    return { tournamentId, success: true };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
};

// Run test
testTournamentWithFormPrizes().then(result => {
  console.log('\\n📋 TEST SUMMARY:');
  if (result.success) {
    console.log('✅ Tournament creation test completed successfully');
    console.log('- Check prize calculations to verify data source');
  } else {
    console.log('❌ Test failed:', result.error);
  }
});
