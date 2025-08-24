const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function debugTriggers() {
  console.log('🔍 Checking triggers on challenges table...');
  
  try {
    // Check triggers
    const { data: triggers, error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          t.tgname as trigger_name,
          p.proname as function_name,
          t.tgenabled,
          pg_get_triggerdef(t.oid) as trigger_definition
        FROM pg_trigger t
        JOIN pg_proc p ON t.tgfoid = p.oid
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'challenges' 
        AND t.tgisinternal = false
        ORDER BY t.tgname;
      `
    });

    if (triggerError) {
      console.log('❌ Trigger Error:', triggerError);
    } else {
      console.log('📋 Triggers:');
      triggers.forEach(trigger => {
        console.log(`- ${trigger.trigger_name} -> ${trigger.function_name}`);
        if (trigger.trigger_definition.includes('challenger_rank')) {
          console.log('  🚨 USES challenger_rank!');
          console.log('  📝 Definition:', trigger.trigger_definition);
        }
      });
    }

    // Check functions that might use challenger_rank
    const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          proname as function_name,
          prosrc as function_body
        FROM pg_proc 
        WHERE prosrc LIKE '%challenger_rank%'
        OR prosrc LIKE '%NEW.challenger_rank%';
      `
    });

    if (funcError) {
      console.log('❌ Function Error:', funcError);
    } else {
      console.log('📋 Functions using challenger_rank:');
      functions.forEach(func => {
        console.log(`- ${func.function_name}`);
        if (func.function_body.includes('NEW.challenger_rank')) {
          console.log('  🚨 USES NEW.challenger_rank!');
        }
      });
    }

  } catch (error) {
    console.log('❌ Debug Error:', error);
  }
}

debugTriggers();
