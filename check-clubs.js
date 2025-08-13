import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function checkTables() {
  console.log('=== KIỂM TRA CÁC TABLE LIÊN QUAN ĐẾN CLUB ===');
  
  const tables = ['club_registrations', 'clubs', 'club_profiles'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(5);
      if (error) {
        console.log(`❌ Table '${table}' error:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists with ${data?.length || 0} records`);
        if (data && data.length > 0) {
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
          data.forEach((record, i) => {
            const name = record.name || record.club_name || 'No name field';
            const status = record.status || 'No status';
            console.log(`   Record ${i+1}: ${name} (Status: ${status})`);
          });
        }
      }
    } catch (e) {
      console.log(`❌ Exception for table '${table}':`, e.message);
    }
  }
}

checkTables().catch(console.error);
