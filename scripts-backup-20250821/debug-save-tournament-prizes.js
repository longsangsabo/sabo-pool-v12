// Debug script for testing saveTournamentPrizes function
const testSaveTournamentPrizes = async () => {
  console.log('🧪 Testing saveTournamentPrizes function...');
  
  const tournamentId = '29db4664-b46d-4a49-9ff1-43a91842fa21';
  const samplePrizes = [
    {
      prize_position: 2,
      position_name: 'Á quân',
      cash_amount: 480000,
      elo_points: 50,
      spa_points: 1100,
      physical_items: [],
      color_theme: 'gold',
      is_visible: true,
      is_guaranteed: true
    },
    {
      prize_position: 3,
      position_name: 'Hạng 3',
      cash_amount: 320000,
      elo_points: 25,
      spa_points: 900,
      physical_items: [],
      color_theme: 'gold',
      is_visible: true,
      is_guaranteed: true
    }
  ];

  try {
    // Simulate the request we would make
    const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.jJoRnBFxmQsGKM2TFfXYr3F6LgXSW3qE6vLzG5rfRWo';
    
    // Prepare prizes data
    const prizesData = samplePrizes.map(prize => ({
      tournament_id: tournamentId,
      prize_position: prize.prize_position,
      position_name: prize.position_name,
      position_description: '',
      cash_amount: prize.cash_amount,
      cash_currency: 'VND',
      elo_points: prize.elo_points,
      spa_points: prize.spa_points,
      physical_items: prize.physical_items,
      color_theme: prize.color_theme,
      is_visible: prize.is_visible,
      is_guaranteed: prize.is_guaranteed,
      display_order: prize.prize_position,
      created_by: null // Will be set by RLS
    }));

    console.log('📋 Prizes to save:', JSON.stringify(prizesData, null, 2));

    const response = await fetch(`${supabaseUrl}/rest/v1/tournament_prizes`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`, // Using anon key for testing
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(prizesData)
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
    } else {
      console.log('✅ Prizes saved successfully!');
    }

  } catch (error) {
    console.error('❌ Error in test:', error);
  }
};

// Export for browser testing
if (typeof window !== 'undefined') {
  window.testSaveTournamentPrizes = testSaveTournamentPrizes;
  console.log('📌 Test function available as window.testSaveTournamentPrizes()');
}
