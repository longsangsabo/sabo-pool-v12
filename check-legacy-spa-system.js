// Check Supabase production database for legacy_spa_points table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔗 Connecting to Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT_SET');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLegacySpaSystem() {
  console.log('\n📊 Checking legacy_spa_points table...');
  
  try {
    // Check if legacy_spa_points table exists
    const { data: tableData, error: tableError } = await supabase
      .from('legacy_spa_points')
      .select('*')
      .limit(5);
    
    if (tableError) {
      console.log('❌ legacy_spa_points table error:', tableError.message);
      console.log('   Code:', tableError.code);
      console.log('   Details:', tableError.details);
      
      if (tableError.code === '42P01') {
        console.log('   → Table does not exist');
      }
    } else {
      console.log('✅ legacy_spa_points table exists!');
      console.log('   Sample data count:', tableData?.length || 0);
      if (tableData && tableData.length > 0) {
        console.log('   Sample record:', JSON.stringify(tableData[0], null, 2));
      }
    }
  } catch (error) {
    console.log('💥 Connection error:', error.message);
  }
  
  console.log('\n🔍 Checking claim_legacy_spa_points function...');
  
  try {
    // Test if claim_legacy_spa_points function exists
    const { data: funcData, error: funcError } = await supabase.rpc('claim_legacy_spa_points', {
      p_claim_code: 'TEST_CODE_NON_EXISTENT'
    });
    
    if (funcError) {
      console.log('❌ claim_legacy_spa_points function error:', funcError.message);
      console.log('   Code:', funcError.code);
      
      if (funcError.code === '42883' || funcError.code === 'PGRST202') {
        console.log('   → Function does not exist - needs to be deployed');
      }
    } else {
      console.log('✅ claim_legacy_spa_points function exists!');
      console.log('   Test response:', funcData);
      
      // If function exists, test it properly
      if (funcData && funcData.success === false && funcData.error) {
        console.log('   ✅ Function working correctly (rejected invalid code as expected)');
      }
    }
  } catch (error) {
    console.log('💥 Function test error:', error.message);
  }
  
  console.log('\n📋 Checking other related tables...');
  
  // Check profiles table
  try {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, spa_points')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ profiles table error:', profilesError.message);
      if (profilesError.message.includes('spa_points')) {
        console.log('   → spa_points column missing - needs to be added');
      }
    } else {
      console.log('✅ profiles table exists with spa_points column');
      console.log('   Sample count:', profilesData?.length || 0);
      if (profilesData && profilesData.length > 0) {
        const withSpaPoints = profilesData.filter(p => p.spa_points > 0);
        console.log('   Users with SPA points:', withSpaPoints.length);
      }
    }
  } catch (error) {
    console.log('❌ profiles check error:', error.message);
  }
  
  // Check spa_transactions table
  try {
    const { data: transData, error: transError } = await supabase
      .from('spa_transactions')
      .select('*')
      .limit(3);
    
    if (transError) {
      console.log('❌ spa_transactions table error:', transError.message);
    } else {
      console.log('✅ spa_transactions table exists');
      console.log('   Sample count:', transData?.length || 0);
    }
  } catch (error) {
    console.log('❌ spa_transactions check error:', error.message);
  }
  
  console.log('\n🏁 Check completed!');
}

checkLegacySpaSystem().catch(console.error);
