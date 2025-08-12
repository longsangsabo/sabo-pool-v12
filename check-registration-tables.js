const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function checkTables() {
  console.log('Looking for registration tables...');
  
  const tables = [
    'tournament_registrations',
    'registrations', 
    'tournament_participants',
    'participants',
    'tournament_members',
    'tournament_entries'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (!error) {
        console.log(`✅ Found table: ${table}`);
        if (data && data.length > 0) {
          console.log('Columns:', Object.keys(data[0]));
          console.log('Sample:', JSON.stringify(data[0], null, 2));
        } else {
          console.log('Table exists but empty');
        }
        console.log('---');
      }
    } catch (e) {
      // Silent fail for non-existent tables
    }
  }
}

checkTables().catch(console.error);
