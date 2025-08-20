#!/usr/bin/env node

// ============================================================================
// CHECK TOURNAMENT_RESULTS TABLE STRUCTURE WITH SERVICE ROLE KEY
// ============================================================================

const SUPABASE_URL = 'https://exlqvlbawytbglioqfbc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

async function checkTournamentResultsSchema() {
  console.log('🔍 CHECKING TOURNAMENT_RESULTS TABLE SCHEMA');
  console.log('=' .repeat(50));
  
  try {
    // First, try to get any existing records to see the schema
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tournament_results?limit=1`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    if (data.length > 0) {
      console.log('✅ Found existing record, columns:');
      const columns = Object.keys(data[0]);
      columns.forEach((col, i) => {
        console.log(`${(i+1).toString().padStart(2)}. ${col}`);
      });
      return columns;
    } else {
      console.log('ℹ️  Table is empty, will try to create a test record to see schema');
      
      // Try to insert a minimal record to see what columns exist
      const testData = {
        tournament_id: '1ee08833-cd9e-4c85-bae2-254681bb8ffc',
        user_id: 'e30e1d1d-d714-4678-b63c-9f403ea2aeac',
        final_position: 1
      };

      const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/tournament_results`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(testData)
      });

      if (insertResponse.ok) {
        const inserted = await insertResponse.json();
        console.log('✅ Test insert successful, columns:');
        const columns = Object.keys(inserted[0]);
        columns.forEach((col, i) => {
          console.log(`${(i+1).toString().padStart(2)}. ${col}`);
        });
        
        // Delete the test record
        await fetch(`${SUPABASE_URL}/rest/v1/tournament_results?tournament_id=eq.${testData.tournament_id}&user_id=eq.${testData.user_id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`
          }
        });
        console.log('🗑️  Test record deleted');
        
        return columns;
      } else {
        const error = await insertResponse.text();
        console.log('❌ Insert failed:', error);
        
        // Try to extract column info from error message
        if (error.includes('column') && error.includes('does not exist')) {
          const match = error.match(/column "([^"]+)" does not exist/);
          if (match) {
            console.log(`❌ Column "${match[1]}" does not exist in tournament_results`);
          }
        }
        return null;
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function testRPCCall() {
  console.log('\n🧪 TESTING RPC CALL');
  console.log('=' .repeat(30));
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/manual_complete_tournament`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        p_tournament_id: '1ee08833-cd9e-4c85-bae2-254681bb8ffc' 
      })
    });

    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ RPC call successful:', result);
    } else {
      console.log('❌ RPC call failed:', result);
      
      // Extract column error if present
      if (result.includes('column') && result.includes('does not exist')) {
        const match = result.match(/column "([^"]+)" .*does not exist/);
        if (match) {
          console.log(`🎯 MISSING COLUMN: "${match[1]}"`);
        }
      }
    }
  } catch (error) {
    console.error('❌ RPC Error:', error.message);
  }
}

async function main() {
  console.log('🚀 REAL DATABASE SCHEMA CHECK');
  console.log('Using SERVICE_ROLE_KEY to check actual tournament_results schema\n');
  
  const columns = await checkTournamentResultsSchema();
  await testRPCCall();
  
  console.log('\n✅ DONE!');
  
  if (columns) {
    console.log('\n📋 AVAILABLE COLUMNS:');
    console.log(columns.join(', '));
  }
}

main().catch(console.error);
