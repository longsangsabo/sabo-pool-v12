"import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugTriggers() {
  console.log('🔍 Checking triggers on tournament_matches table...');
  
  // Check triggers
  const { data: triggers, error: triggerError } = await supabase
    .from('information_schema.triggers')
    .select('trigger_name, event_object_table, action_timing, event_manipulation, action_statement')
    .eq('event_object_table', 'tournament_matches')
    .eq('trigger_schema', 'public');
    
  if (triggerError) {
    console.error('❌ Error getting triggers:', triggerError);
  } else {
    console.log('📋 Triggers found:', triggers);
  }
  
  // Check constraints
  console.log('\n🔍 Checking constraints on tournament_matches table...');
  
  const { data: constraints, error: constraintError } = await supabase
    .rpc('get_table_constraints', { table_name: 'tournament_matches' });
    
  if (constraintError) {
    console.error('❌ Error getting constraints:', constraintError);
    
    // Try alternative way
    const { data: pgConstraints, error: pgError } = await supabase
      .from('pg_constraint')
      .select(`
        conname,
        contype,
        pg_get_constraintdef(oid) as definition
      `)
      .eq('conrelid', 'tournament_matches'::regclass);
      
    if (pgError) {
      console.error('❌ Error getting pg_constraints:', pgError);
    } else {
      console.log('📋 Constraints found:', pgConstraints);
    }
  } else {
    console.log('📋 Constraints found:', constraints);
  }
  
  // Check for ON CONFLICT issues by testing a sample update
  console.log('\n🔍 Testing sample tournament_matches update...');
  
  const { data: matches, error: matchError } = await supabase
    .from('tournament_matches')
    .select('id, tournament_id, round_number, match_number')
    .limit(1);
    
  if (matchError) {
    console.error('❌ Error getting sample match:', matchError);
  } else if (matches && matches.length > 0) {
    const match = matches[0];
    console.log('📋 Sample match:', match);
    
    // Try to update with same values (should not cause conflicts)
    const { data: updateResult, error: updateError } = await supabase
      .from('tournament_matches')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', match.id)
      .select();
      
    if (updateError) {
      console.error('❌ Update error:', updateError);
      console.log('🎯 This might be the source of your ON CONFLICT error!');
    } else {
      console.log('✅ Update successful:', updateResult);
    }
  }
}

debugTriggers().catch(console.error);
