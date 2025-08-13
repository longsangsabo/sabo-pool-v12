import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkDoubleEliminationFunctions() {
  console.log('🔍 Checking available double elimination functions...');
  
  try {
    // Check for all possible double elimination functions
    const functionsToCheck = [
      'generate_double_elimination_bracket_complete_v8',
      'generate_double_elimination_bracket_complete',
      'generate_complete_tournament_bracket',
      'initialize_sabo_tournament',
      'create_double_elimination_bracket_enhanced',
      'generate_advanced_tournament_bracket'
    ];
    
    for (const funcName of functionsToCheck) {
      console.log(`\n🧪 Testing: ${funcName}`);
      
      try {
        // Try to call function with minimal parameters to check if it exists
        const { data, error } = await supabase.rpc(funcName, {
          p_tournament_id: '00000000-0000-0000-0000-000000000000' // Fake UUID
        });
        
        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('function') && error.message.includes('unknown')) {
            console.log(`   ❌ ${funcName} - Does not exist`);
          } else {
            console.log(`   ✅ ${funcName} - Exists (error: ${error.message.substring(0, 50)}...)`);
          }
        } else {
          console.log(`   ✅ ${funcName} - Exists and callable`);
        }
      } catch (e) {
        console.log(`   ❌ ${funcName} - Error: ${e.message}`);
      }
    }

    // Also check what functions are actually available in database
    console.log('\n📋 Checking available functions in database...');
    const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          proname as function_name,
          prosrc IS NOT NULL as has_body
        FROM pg_proc 
        WHERE proname LIKE '%double%elimination%' 
           OR proname LIKE '%bracket%'
           OR proname LIKE '%tournament%'
        ORDER BY proname;
      `
    });

    if (funcError) {
      console.log('⚠️ Cannot query database functions directly');
    } else if (functions) {
      console.log('Available tournament functions:');
      functions.forEach(func => {
        console.log(`   - ${func.function_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkDoubleEliminationFunctions();
