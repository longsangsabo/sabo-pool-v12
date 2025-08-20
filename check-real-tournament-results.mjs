#!/usr/bin/env node

// CHECK REAL TOURNAMENT_RESULTS TABLE STRUCTURE

const SUPABASE_URL = 'https://exlqvlbawytbglioqfbc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

async function checkTournamentResultsStructure() {
  console.log('🔍 CHECKING TOURNAMENT_RESULTS REAL STRUCTURE');
  console.log('='.repeat(60));
  
  try {
    // Try to insert a dummy record to see what columns are actually required
    const testInsert = await fetch(`${SUPABASE_URL}/rest/v1/tournament_results`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        tournament_id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        final_position: 1
      })
    });

    const error = await testInsert.json();
    if (error.code) {
      console.log('INSERT ERROR (shows required columns):');
      console.log(error.message);
      console.log(error.details);
    }
  } catch (e) {
    console.log('Error testing insert:', e.message);
  }

  // Try to get schema info via a simple select
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tournament_results?limit=0`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });

    if (response.ok) {
      console.log('\n✅ tournament_results table exists and is accessible');
      
      // Now try a simple insert to see what the actual schema wants
      console.log('\n🧪 Testing minimal insert to discover schema...');
      
      const minimalTest = await fetch(`${SUPABASE_URL}/rest/v1/tournament_results`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: '12345678-1234-1234-1234-123456789012',
          tournament_id: '12345678-1234-1234-1234-123456789012',
          user_id: '12345678-1234-1234-1234-123456789012',
          final_position: 1
        })
      });

      const result = await minimalTest.text();
      console.log('Insert response:', result);
      
      if (!minimalTest.ok) {
        console.log('Insert failed - this tells us the real schema:');
        console.log(result);
      } else {
        console.log('✅ Insert successful with minimal columns');
        
        // Clean up the test record
        await fetch(`${SUPABASE_URL}/rest/v1/tournament_results?id=eq.12345678-1234-1234-1234-123456789012`, {
          method: 'DELETE',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`
          }
        });
        console.log('🧹 Test record cleaned up');
      }
    } else {
      console.log('❌ tournament_results table not accessible');
      console.log('Response:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTournamentResultsStructure();
