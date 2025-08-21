// Script để tạo test data cho tournament results
const tournamentId = '1ee08833-cd9e-4c85-bae2-254681bb8ffc';

// Danh sách test users (dùng user thực tế từ database)
const testUsers = [
  'f4bf9554-f2a7-4aee-8ba3-7c38b89771ca', // Hoà Lê
];

// Tạo sample tournament results
const createTestTournamentResults = async () => {
  console.log('🏆 Creating test tournament results...');
  
  const testResults = [
    {
      tournament_id: tournamentId,
      user_id: 'f4bf9554-f2a7-4aee-8ba3-7c38b89771ca',
      final_position: 1,
      matches_played: 5,
      matches_won: 5,
      matches_lost: 0,
      win_percentage: 100.00,
      spa_points_earned: 50,
      elo_points_earned: 25,
      prize_amount: 100.00,
      physical_rewards: ['Gold Medal', 'Championship Trophy'],
      placement_type: 'Champion'
    }
  ];

  // Create results using Supabase REST API
  for (const result of testResults) {
    const response = await fetch('https://exlqvlbawytbglioqfbc.supabase.co/rest/v1/tournament_results', {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(result)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Created tournament result:', data);
    } else {
      const error = await response.json();
      console.error('❌ Error creating tournament result:', error);
    }
  }
};

// Update tournament status to completed
const updateTournamentStatus = async () => {
  console.log('🏁 Updating tournament status to completed...');
  
  const response = await fetch(`https://exlqvlbawytbglioqfbc.supabase.co/rest/v1/tournaments?id=eq.${tournamentId}`, {
    method: 'PATCH',
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      status: 'completed',
      winner_id: 'f4bf9554-f2a7-4aee-8ba3-7c38b89771ca'
    })
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Tournament status updated:', data);
  } else {
    const error = await response.json();
    console.error('❌ Error updating tournament:', error);
  }
};

// Run the script
createTestTournamentResults()
  .then(() => updateTournamentStatus())
  .then(() => {
    console.log('🎯 Test data creation completed!');
    console.log('You can now check the tournament results tab');
  })
  .catch(console.error);
