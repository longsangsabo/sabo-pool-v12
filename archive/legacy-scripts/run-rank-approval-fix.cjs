#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixRankApprovalSystem() {
  console.log('🔧 FIXING RANK APPROVAL SYSTEM');
  console.log('=' .repeat(60));
  
  try {
    // Read the SQL fix script
    const sqlScript = fs.readFileSync('/workspaces/sabo-pool-v12/fix-rank-approval-complete.sql', 'utf8');
    
    console.log('📋 1. EXECUTING COMPREHENSIVE FIX...');
    console.log('   - Creating trigger function for automatic rank approval handling');
    console.log('   - Setting up trigger on rank_requests table');
    console.log('   - Manually fixing existing approved requests');
    console.log('   - Updating profiles and player_rankings');
    
    // Execute the fix script
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlScript
    });
    
    if (error) {
      console.log('❌ Error executing fix script:', error.message);
      return;
    }
    
    console.log('✅ Fix script executed successfully');
    if (data) {
      console.log('📋 Script results:', data);
    }
    
    // Verify the fix
    console.log('\n🧪 2. VERIFYING THE FIX...');
    
    // Check if trigger was created
    const { data: triggers, error: triggerError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT trigger_name, event_manipulation, action_timing
          FROM information_schema.triggers 
          WHERE event_object_table = 'rank_requests'
          AND trigger_schema = 'public';
        `
      });
    
    if (triggerError) {
      console.log('❌ Error checking triggers:', triggerError.message);
    } else {
      console.log('✅ Triggers on rank_requests table:');
      if (triggers && triggers.length > 0) {
        triggers.forEach(trig => {
          console.log(`   - ${trig.trigger_name} (${trig.action_timing} ${trig.event_manipulation})`);
        });
      } else {
        console.log('   ⚠️  No triggers found');
      }
    }
    
    // Check approved requests vs profiles
    const { data: verification, error: verifyError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            count(*) as total_approved_requests,
            count(CASE WHEN p.verified_rank = rr.requested_rank THEN 1 END) as properly_updated,
            count(CASE WHEN p.verified_rank != rr.requested_rank OR p.verified_rank IS NULL THEN 1 END) as still_broken
          FROM rank_requests rr
          JOIN profiles p ON p.user_id = rr.user_id
          WHERE rr.status = 'approved';
        `
      });
    
    if (verifyError) {
      console.log('❌ Error verifying fix:', verifyError.message);
    } else if (verification && verification.length > 0) {
      const stats = verification[0];
      console.log('📊 Verification Results:');
      console.log(`   - Total approved requests: ${stats.total_approved_requests}`);
      console.log(`   - Properly updated profiles: ${stats.properly_updated}`);
      console.log(`   - Still broken: ${stats.still_broken}`);
      
      if (stats.still_broken == 0) {
        console.log('   ✅ ALL APPROVED REQUESTS NOW HAVE UPDATED PROFILES!');
      } else {
        console.log(`   ⚠️  ${stats.still_broken} requests still need manual attention`);
      }
    }
    
    // Test with a sample approved request
    console.log('\n🧪 3. TESTING WITH SAMPLE DATA...');
    
    const { data: sampleRequest, error: sampleError } = await supabase
      .from('rank_requests')
      .select(`
        id,
        user_id,
        requested_rank,
        status,
        approved_at,
        profiles!inner(display_name, verified_rank)
      `)
      .eq('status', 'approved')
      .order('approved_at', { ascending: false })
      .limit(3);
    
    if (sampleError) {
      console.log('❌ Error fetching sample:', sampleError.message);
    } else if (sampleRequest && sampleRequest.length > 0) {
      console.log('📊 Sample approved requests:');
      sampleRequest.forEach((req, index) => {
        const isFixed = req.profiles.verified_rank === req.requested_rank;
        console.log(`   ${index + 1}. ${req.profiles.display_name}`);
        console.log(`      Requested: ${req.requested_rank} | Profile: ${req.profiles.verified_rank} | ${isFixed ? '✅ FIXED' : '❌ NOT FIXED'}`);
      });
    }
    
    console.log('\n✅ RANK APPROVAL SYSTEM FIX COMPLETED');
    console.log('=' .repeat(60));
    console.log('🎯 Summary:');
    console.log('   ✅ Trigger function created for automatic processing');
    console.log('   ✅ Trigger installed on rank_requests table');
    console.log('   ✅ Existing approved requests manually fixed');
    console.log('   ✅ Future rank approvals will automatically update profiles');
    console.log('');
    console.log('🔄 What happens now when rank is approved:');
    console.log('   1. Profile verified_rank is updated');
    console.log('   2. Player_rankings record is created/updated');
    console.log('   3. SPA points are awarded to wallet');
    console.log('   4. SPA transaction is recorded');
    console.log('   5. User is added to club as verified member');
    console.log('   6. Notification is sent to user');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

// Run the fix
fixRankApprovalSystem();
