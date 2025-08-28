#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function simpleFixApprovedRequests() {
  console.log('🔧 SIMPLE FIX FOR APPROVED RANK REQUESTS');
  console.log('=' .repeat(60));
  
  try {
    // 1. Get all approved requests with unupdated profiles
    console.log('📋 1. FINDING APPROVED REQUESTS WITH UNUPDATED PROFILES...');
    
    const { data: brokenRequests, error: requestsError } = await supabase
      .from('rank_requests')
      .select(`
        id,
        user_id,
        club_id,
        requested_rank,
        status,
        approved_at,
        profiles!inner(display_name, verified_rank)
      `)
      .eq('status', 'approved')
      .order('approved_at', { ascending: false });
    
    if (requestsError) {
      console.log('❌ Error fetching requests:', requestsError.message);
      return;
    }
    
    // Filter only those that need fixing
    const needsFixing = brokenRequests.filter(req => 
      req.profiles.verified_rank !== req.requested_rank
    );
    
    console.log(`✅ Found ${needsFixing.length} requests that need fixing`);
    
    if (needsFixing.length === 0) {
      console.log('🎉 All requests are already properly updated!');
      return;
    }
    
    console.log('\n📋 Requests to fix:');
    needsFixing.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.profiles.display_name}: ${req.profiles.verified_rank || 'NULL'} → ${req.requested_rank}`);
    });
    
    // 2. Fix each request - ONLY update verified_rank in profiles
    console.log('\n📋 2. UPDATING PROFILES VERIFIED_RANK...');
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const req of needsFixing) {
      try {
        console.log(`\n🔧 Fixing: ${req.profiles.display_name} (${req.requested_rank})`);
        
        // Step 1: Update ONLY verified_rank in profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            verified_rank: req.requested_rank,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', req.user_id);
        
        if (profileError) {
          throw new Error(`Profile update failed: ${profileError.message}`);
        }
        
        console.log(`   ✅ Profile updated: ${req.profiles.verified_rank || 'NULL'} → ${req.requested_rank}`);
        
        // Step 2: Update player_rankings verified_rank (if table exists)
        try {
          const { error: rankingError } = await supabase
            .from('player_rankings')
            .upsert({
              user_id: req.user_id,
              verified_rank: req.requested_rank,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            });
          
          if (rankingError) {
            console.log(`   ⚠️  Player rankings update failed: ${rankingError.message}`);
          } else {
            console.log(`   ✅ Player rankings updated with verified rank`);
          }
        } catch (e) {
          console.log(`   ⚠️  Player rankings table issue: ${e.message}`);
        }
        
        fixedCount++;
        console.log(`   🎉 Successfully fixed request for ${req.profiles.display_name}`);
        
      } catch (error) {
        console.log(`   ❌ Error fixing request: ${error.message}`);
        errorCount++;
      }
    }
    
    // 3. Summary
    console.log('\n📊 3. SUMMARY');
    console.log('=' .repeat(50));
    console.log(`✅ Successfully fixed: ${fixedCount} requests`);
    console.log(`❌ Failed to fix: ${errorCount} requests`);
    console.log(`📋 Total processed: ${needsFixing.length} requests`);
    
    // 4. Verification
    console.log('\n📋 4. VERIFICATION - CHECKING FIXED REQUESTS...');
    
    const { data: verifyRequests, error: verifyError } = await supabase
      .from('rank_requests')
      .select(`
        id,
        user_id,
        requested_rank,
        status,
        profiles!inner(display_name, verified_rank)
      `)
      .eq('status', 'approved')
      .in('id', needsFixing.map(r => r.id));
    
    if (verifyError) {
      console.log('❌ Error verifying fixes:', verifyError.message);
    } else {
      console.log('📊 Verification results:');
      let fixedVerificationCount = 0;
      verifyRequests.forEach((req, index) => {
        const isFixed = req.profiles.verified_rank === req.requested_rank;
        console.log(`   ${index + 1}. ${req.profiles.display_name}: ${req.requested_rank} | ${isFixed ? '✅ FIXED' : '❌ STILL BROKEN'}`);
        if (isFixed) fixedVerificationCount++;
      });
      
      if (fixedVerificationCount === verifyRequests.length) {
        console.log('\n🎉 ALL REQUESTS SUCCESSFULLY FIXED!');
      } else {
        console.log(`\n⚠️  ${verifyRequests.length - fixedVerificationCount} requests still need attention`);
      }
    }
    
    // 5. Next steps
    console.log('\n🔄 5. NEXT STEPS TO COMPLETE THE FIX:');
    console.log('=' .repeat(50));
    console.log('✅ Profile verified_rank has been updated for all users');
    console.log('📋 You may also want to:');
    console.log('   1. Award SPA points for rank approvals (if needed)');
    console.log('   2. Send notifications to users about their approved ranks');
    console.log('   3. Add users to clubs as verified members');
    console.log('   4. Set up trigger for future automatic processing');
    
    console.log('\n✅ SIMPLE FIX COMPLETED');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Simple fix failed:', error.message);
  }
}

// Run the simple fix
simpleFixApprovedRequests();
