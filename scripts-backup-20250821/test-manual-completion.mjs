#!/usr/bin/env node

// Test manual completion for the completed tournament

const SUPABASE_URL = 'https://exlqvlbawytbglioqfbc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

async function testManualCompletion() {
  const tournamentId = '1ee08833-cd9e-4c85-bae2-254681bb8ffc'; // From the final match data
  
  console.log('Testing manual completion for tournament:', tournamentId);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/manual_complete_tournament`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_tournament_id: tournamentId })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('SUCCESS:', result);
    } else {
      console.log('ERROR:', result);
    }
  } catch (error) {
    console.error('Exception:', error.message);
  }
}

testManualCompletion();
