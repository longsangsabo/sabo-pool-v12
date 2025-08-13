const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.ORMM0nSs8QfKYI8H04m-IfNM7NTShKWq21LqP_MpjRM'
);

async function checkDatabase() {
  console.log('=== DATABASE CHECK ===\n');
  
  try {
    // Check clubs
    const { data: clubs, error: clubsError } = await supabase
      .from('club_profiles')
      .select('*');
    
    console.log('📋 CLUBS:');
    if (clubsError) {
      console.log('  Error:', clubsError.message);
    } else {
      console.log(`  Found: ${clubs?.length || 0} clubs`);
      clubs?.forEach((club, i) => {
        console.log(`  ${i+1}. ${club.club_name || club.name || 'No Name'} (ID: ${club.id?.substring(0,8)}...)`);
      });
    }
    
    // Check rank requests  
    const { data: requests, error: requestsError } = await supabase
      .from('rank_requests')
      .select('*');
      
    console.log('\n📝 RANK REQUESTS:');
    if (requestsError) {
      console.log('  Error:', requestsError.message);
    } else {
      console.log(`  Found: ${requests?.length || 0} requests`);
      requests?.slice(0, 3).forEach((req, i) => {
        console.log(`  ${i+1}. ${req.requested_rank} (${req.status}) - User: ${req.user_id?.substring(0,8)}...`);
      });
    }
    
    // Check club members
    const { data: members, error: membersError } = await supabase
      .from('club_members')
      .select('*');
      
    console.log('\n👥 CLUB MEMBERS:');
    if (membersError) {
      console.log('  Error:', membersError.message);
    } else {
      console.log(`  Found: ${members?.length || 0} members`);
      members?.slice(0, 3).forEach((mem, i) => {
        console.log(`  ${i+1}. User ${mem.user_id?.substring(0,8)}... in Club ${mem.club_id?.substring(0,8)}...`);
      });
    }
    
  } catch (error) {
    console.error('Script error:', error.message);
  }
}

checkDatabase();
