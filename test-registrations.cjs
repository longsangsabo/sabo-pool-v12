const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function testTable() {
  console.log('Testing tournament_registrations table...');
  
  try {
    // Test if table exists
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('*')
      .limit(1);
      
    if (!error) {
      console.log('✅ Table exists and is accessible!');
      if (data && data.length > 0) {
        console.log('Sample data:', data[0]);
      } else {
        console.log('Table is empty');
      }
    } else {
      console.log('❌ Table error:', error.message);
      
      // Try to create some test registrations if table exists
      if (error.code !== '42P01') {
        console.log('Attempting to create test registrations...');
        
        const testRegistrations = [
          {
            tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f',
            user_id: 'e411093e-144a-46c3-9def-37186c4ee6c8',
            registration_status: 'confirmed',
            payment_status: 'paid'
          },
          {
            tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f', 
            user_id: '519cf7c9-e112-40b2-9e4d-0cd44783ec9e',
            registration_status: 'confirmed',
            payment_status: 'paid'
          }
        ];
        
        const { data: insertData, error: insertError } = await supabase
          .from('tournament_registrations')
          .insert(testRegistrations)
          .select();
          
        if (!insertError) {
          console.log('✅ Test registrations created:', insertData.length);
        } else {
          console.log('❌ Insert failed:', insertError.message);
        }
      }
    }
    
  } catch (e) {
    console.error('Exception:', e.message);
  }
}

testTable();
