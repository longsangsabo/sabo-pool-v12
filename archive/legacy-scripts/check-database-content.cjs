const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseContent() {
  console.log('🔍 Checking database content...\n');
  
  try {
    // Check profiles table
    console.log('1. 👤 Profiles table:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, verified_rank, is_admin')
      .limit(10);
    
    if (profilesError) {
      console.error('❌ Error:', profilesError);
    } else {
      console.log(`Found ${profiles?.length || 0} profiles`);
      profiles?.forEach(p => {
        console.log(`  - ${p.full_name || p.display_name || 'Unknown'} (${p.user_id})`);
        console.log(`    Rank: ${p.verified_rank || 'None'}, Admin: ${p.is_admin || false}`);
      });
    }
    
    // Check club_profiles table
    console.log('\n2. 🏢 Club Profiles table:');
    const { data: clubProfiles, error: clubError } = await supabase
      .from('club_profiles')
      .select('*')
      .limit(5);
    
    if (clubError) {
      console.error('❌ Error:', clubError);
    } else {
      console.log(`Found ${clubProfiles?.length || 0} club profiles`);
      clubProfiles?.forEach(c => {
        console.log(`  - ${c.club_name} (Owner: ${c.user_id})`);
        console.log(`    Status: ${c.verification_status}, Created: ${c.created_at}`);
      });
    }
    
    // Check rank_requests table
    console.log('\n3. 🏆 Rank Requests table:');
    const { data: rankRequests, error: rankError } = await supabase
      .from('rank_requests')
      .select('user_id, requested_rank, status, club_id')
      .limit(10);
    
    if (rankError) {
      console.error('❌ Error:', rankError);
    } else {
      console.log(`Found ${rankRequests?.length || 0} rank requests`);
      rankRequests?.forEach(r => {
        console.log(`  - User: ${r.user_id}, Rank: ${r.requested_rank}`);
        console.log(`    Status: ${r.status}, Club: ${r.club_id || 'None'}`);
      });
    }
    
    // Check club_members table
    console.log('\n4. 👥 Club Members table:');
    const { data: clubMembers, error: membersError } = await supabase
      .from('club_members')
      .select('*')
      .limit(10);
    
    if (membersError) {
      console.error('❌ Error:', membersError);
    } else {
      console.log(`Found ${clubMembers?.length || 0} club members`);
      clubMembers?.forEach(m => {
        console.log(`  - User: ${m.user_id}, Club: ${m.club_id}`);
        console.log(`    Status: ${m.status}, Join Date: ${m.join_date}`);
      });
    }
    
    // Check table existence
    console.log('\n5. 📋 Table Schema Check:');
    const tables = ['profiles', 'club_profiles', 'rank_requests', 'club_members'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`  ✅ Table '${table}': Accessible`);
        }
      } catch (e) {
        console.log(`  ❌ Table '${table}': ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

checkDatabaseContent();
