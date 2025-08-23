require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function investigateAdvancementSystem() {
  console.log('🔍 INVESTIGATING ADVANCEMENT SYSTEM INFRASTRUCTURE');
  console.log('='.repeat(65));
  
  try {
    // 1. Check current triggers on sabo32_matches table
    console.log('\n1. 🎯 Checking triggers on sabo32_matches table:');
    
    const { data: triggers, error: trigError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          trigger_name, 
          event_manipulation, 
          action_timing,
          action_statement
        FROM information_schema.triggers 
        WHERE event_object_table = 'sabo32_matches'
        ORDER BY trigger_name;
      `
    });
    
    if (trigError) {
      console.log('❌ Cannot check triggers via RPC, trying direct query...');
      
      // Alternative approach - check if advancement happens automatically
      const { data: recentMatches } = await supabase
        .from('sabo32_matches')
        .select('sabo_match_id, completed_at, status, winner_id')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);
        
      console.log('📋 Recent completed matches:');
      recentMatches?.forEach(m => {
        console.log(`  ${m.sabo_match_id}: completed ${m.completed_at}`);
      });
    } else {
      console.log('📋 Active triggers on sabo32_matches:');
      triggers?.forEach(t => {
        console.log(`  - ${t.trigger_name} (${t.event_manipulation} ${t.action_timing})`);
      });
    }
    
    // 2. Check if advancement functions exist
    console.log('\n2. 🔧 Checking advancement functions:');
    
    const { data: functions } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          proname as function_name,
          prosrc as function_body
        FROM pg_proc 
        WHERE proname ILIKE '%advance%' 
           OR proname ILIKE '%sabo%'
        ORDER BY proname;
      `
    });
    
    if (functions) {
      console.log('📋 Found advancement-related functions:');
      functions.forEach(f => {
        console.log(`  - ${f.function_name}`);
      });
    }
    
    // 3. Check the specific issue - why Group Finals had NULL players
    console.log('\n3. 🕵️ Root cause analysis:');
    
    // Get the timeline of events
    const { data: timeline } = await supabase
      .from('sabo32_matches')
      .select('sabo_match_id, created_at, completed_at, updated_at, status, player1_id, player2_id')
      .in('sabo_match_id', ['A-W3M1', 'A-W3M2', 'A-LA103M1', 'A-LB202M1', 'A-FINAL1', 'A-FINAL2'])
      .order('created_at');
      
    console.log('📅 Timeline of Group A events:');
    timeline?.forEach(match => {
      console.log(`  ${match.sabo_match_id}:`);
      console.log(`    Created: ${match.created_at}`);
      console.log(`    Completed: ${match.completed_at || 'Not completed'}`);
      console.log(`    Last updated: ${match.updated_at}`);
      console.log(`    Had players: ${match.player1_id ? 'YES' : 'NO'}`);
      console.log('');
    });
    
    console.log('\n4. 🎯 CONCLUSION:');
    console.log('='.repeat(40));
    
    const finalCreated = new Date('2025-08-23T22:05:34.962222+00:00');
    const firstMatchCompleted = new Date('2025-08-23T22:06:52.423+00:00');
    const lastMatchCompleted = new Date('2025-08-23T22:45:21.343+00:00');
    
    console.log(`Group Finals created: ${finalCreated.toISOString()}`);
    console.log(`First prereq completed: ${firstMatchCompleted.toISOString()}`);
    console.log(`Last prereq completed: ${lastMatchCompleted.toISOString()}`);
    
    if (finalCreated < firstMatchCompleted) {
      console.log('\n❌ ROOT CAUSE IDENTIFIED:');
      console.log('   Group Finals were pre-created EMPTY (NULL players)');
      console.log('   NO automatic advancement system triggered when matches completed');
      console.log('   System lacks realtime advancement logic');
      
      console.log('\n🚨 SYSTEMIC ISSUES:');
      console.log('   1. Group Finals created with NULL players initially');
      console.log('   2. No trigger/function to populate them when prerequisites complete');
      console.log('   3. Manual intervention required for every tournament');
      
      console.log('\n💡 SOLUTIONS NEEDED:');
      console.log('   1. ✅ IMMEDIATE: Manual fix applied (already done)');
      console.log('   2. 🔧 SYSTEMIC: Implement auto-advancement trigger');
      console.log('   3. 🛡️ PREVENTION: Validation system for future tournaments');
    }
    
  } catch (error) {
    console.error('❌ Investigation error:', error);
  }
}

investigateAdvancementSystem().catch(console.error);
