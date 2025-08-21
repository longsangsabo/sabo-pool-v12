#!/usr/bin/env node

// INSPECT REAL TOURNAMENT_RESULTS TABLE STRUCTURE

const SUPABASE_URL = 'https://exlqvlbawytbglioqfbc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

async function inspectTournamentResultsSchema() {
  console.log('🔍 INSPECTING TOURNAMENT_RESULTS TABLE SCHEMA');
  console.log('='.repeat(60));
  
  try {
    // Get some existing tournament_results records to see the actual columns
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tournament_results?limit=5`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ tournament_results data found:');
      console.log('Number of records:', data.length);
      
      if (data.length > 0) {
        console.log('\n📋 ACTUAL COLUMNS IN tournament_results:');
        const firstRecord = data[0];
        Object.keys(firstRecord).forEach(key => {
          console.log(`  - ${key}: ${typeof firstRecord[key]} (${firstRecord[key]})`);
        });
        
        console.log('\n📊 SAMPLE DATA:');
        data.forEach((record, index) => {
          console.log(`Record ${index + 1}:`, JSON.stringify(record, null, 2));
        });
      } else {
        console.log('⚠️ No tournament_results records found');
        
        // Try to get the table structure via a different method
        console.log('\n🔍 Trying to get table structure...');
        
        // Get a valid tournament_id first
        const tournamentsResponse = await fetch(`${SUPABASE_URL}/rest/v1/tournaments?select=id&limit=1`, {
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`
          }
        });
        
        if (tournamentsResponse.ok) {
          const tournaments = await tournamentsResponse.json();
          if (tournaments.length > 0) {
            const validTournamentId = tournaments[0].id;
            console.log('Found valid tournament_id:', validTournamentId);
            
            // Get a valid user_id
            const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/tournament_registrations?select=user_id&tournament_id=eq.${validTournamentId}&limit=1`, {
              headers: {
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`
              }
            });
            
            if (usersResponse.ok) {
              const users = await usersResponse.json();
              if (users.length > 0) {
                const validUserId = users[0].user_id;
                console.log('Found valid user_id:', validUserId);
                
                // Try to insert a test record to see required columns
                console.log('\n🧪 Testing insert with valid IDs...');
                const testInsert = await fetch(`${SUPABASE_URL}/rest/v1/tournament_results`, {
                  method: 'POST',
                  headers: {
                    'apikey': SERVICE_KEY,
                    'Authorization': `Bearer ${SERVICE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                  },
                  body: JSON.stringify({
                    tournament_id: validTournamentId,
                    user_id: validUserId,
                    final_position: 999
                  })
                });

                const insertResult = await testInsert.text();
                console.log('Insert result:', insertResult);
                
                if (testInsert.ok) {
                  console.log('✅ Insert successful! This shows the minimum required columns.');
                  
                  // Now get the inserted record to see all columns
                  const getResult = await fetch(`${SUPABASE_URL}/rest/v1/tournament_results?tournament_id=eq.${validTournamentId}&user_id=eq.${validUserId}&final_position=eq.999`, {
                    headers: {
                      'apikey': SERVICE_KEY,
                      'Authorization': `Bearer ${SERVICE_KEY}`
                    }
                  });
                  
                  if (getResult.ok) {
                    const insertedData = await getResult.json();
                    if (insertedData.length > 0) {
                      console.log('\n📋 INSERTED RECORD COLUMNS:');
                      Object.keys(insertedData[0]).forEach(key => {
                        console.log(`  - ${key}: ${typeof insertedData[0][key]} (${insertedData[0][key]})`);
                      });
                    }
                    
                    // Clean up
                    await fetch(`${SUPABASE_URL}/rest/v1/tournament_results?tournament_id=eq.${validTournamentId}&user_id=eq.${validUserId}&final_position=eq.999`, {
                      method: 'DELETE',
                      headers: {
                        'apikey': SERVICE_KEY,
                        'Authorization': `Bearer ${SERVICE_KEY}`
                      }
                    });
                    console.log('🧹 Test record cleaned up');
                  }
                } else {
                  console.log('❌ Insert failed:', insertResult);
                }
              }
            }
          }
        }
      }
    } else {
      console.log('❌ Failed to access tournament_results table');
      console.log('Status:', response.status);
      console.log('Response:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

inspectTournamentResultsSchema();
