const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase with correct project
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema and tables...\n');
    
    // List all tables in public schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables')
      .catch(async () => {
        // Fallback: try to query some common tables
        console.log('📋 Checking common tables...');
        
        const tableChecks = [
          'profiles',
          'user_roles', 
          'user_streaks',
          'auth.users'
        ];
        
        for (const tableName of tableChecks) {
          try {
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
              
            if (error) {
              console.log(`❌ Table '${tableName}': ${error.message}`);
            } else {
              console.log(`✅ Table '${tableName}': exists`);
            }
          } catch (e) {
            console.log(`❌ Table '${tableName}': ${e.message}`);
          }
        }
      });
    
    // Check profiles table specifically
    console.log('\n📊 PROFILES TABLE SAMPLE:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email, role, display_name')
      .limit(5);
      
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`Found ${profiles.length} profiles:`);
      profiles.forEach(profile => {
        console.log(`  📧 ${profile.email} | Role: ${profile.role || 'none'} | ID: ${profile.user_id}`);
      });
    }
    
    // Check for sabomedia23 specifically
    console.log('\n🎯 SEARCHING FOR sabomedia23@gmail.com:');
    const { data: sabomedia23, error: saboError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'sabomedia23@gmail.com')
      .single();
      
    if (saboError) {
      console.log(`❌ Not found: ${saboError.message}`);
    } else {
      console.log(`✅ Found: ${JSON.stringify(sabomedia23, null, 2)}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDatabaseSchema();
