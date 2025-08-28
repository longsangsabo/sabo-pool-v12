#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function manualFixApprovedRequests() {
  console.log('🔧 MANUAL FIX FOR APPROVED RANK REQUESTS');
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
        approved_by,
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
    
    // 2. Fix each request manually
    console.log('\n📋 2. FIXING EACH REQUEST MANUALLY...');
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const req of needsFixing) {
      try {
        console.log(`\n🔧 Fixing: ${req.profiles.display_name} (${req.requested_rank})`);
        
        // Calculate SPA reward
        const spaReward = calculateSpaReward(req.requested_rank);
        
        // Step 1: Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            verified_rank: req.requested_rank,
            rank_verified_at: req.approved_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', req.user_id);
        
        if (profileError) {
          throw new Error(`Profile update failed: ${profileError.message}`);
        }
        
        console.log(`   ✅ Profile updated: ${req.profiles.verified_rank} → ${req.requested_rank}`);
        
        // Step 2: Update/create player_rankings
        const { error: rankingError } = await supabase
          .from('player_rankings')
          .upsert({
            user_id: req.user_id,
            verified_rank: req.requested_rank,
            spa_points: spaReward,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (rankingError) {
          console.log(`   ⚠️  Player rankings update failed: ${rankingError.message}`);
        } else {
          console.log(`   ✅ Player rankings updated with ${spaReward} SPA points`);
        }
        
        // Step 3: Update wallet (if exists)
        const { error: walletError } = await supabase
          .from('wallets')
          .upsert({
            user_id: req.user_id,
            points_balance: spaReward,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (walletError) {
          console.log(`   ⚠️  Wallet update failed: ${walletError.message}`);
        } else {
          console.log(`   ✅ Wallet updated with ${spaReward} points`);
        }
        
        // Step 4: Create SPA transaction (if spa_transactions table exists)
        try {
          const { error: transactionError } = await supabase
            .from('spa_transactions')
            .insert({
              user_id: req.user_id,
              points: spaReward,
              transaction_type: 'rank_approval',
              description: `Rank ${req.requested_rank} approved (retroactive fix)`,
              reference_id: req.id,
              reference_type: 'rank_request',
              created_at: req.approved_at || new Date().toISOString()
            });
          
          if (transactionError) {
            console.log(`   ⚠️  SPA transaction creation failed: ${transactionError.message}`);
          } else {
            console.log(`   ✅ SPA transaction created`);
          }
        } catch (e) {
          console.log(`   ⚠️  SPA transaction table may not exist`);
        }
        
        // Step 5: Add to club (if club_members table exists)
        try {
          if (req.club_id) {
            const { error: memberError } = await supabase
              .from('club_members')
              .upsert({
                club_id: req.club_id,
                user_id: req.user_id,
                status: 'active',
                join_date: req.approved_at || new Date().toISOString(),
                membership_type: 'verified_member',
                role: 'member',
                created_at: new Date().toISOString()
              }, {
                onConflict: 'club_id,user_id'
              });
            
            if (memberError) {
              console.log(`   ⚠️  Club membership update failed: ${memberError.message}`);
            } else {
              console.log(`   ✅ Added to club as verified member`);
            }
          }
        } catch (e) {
          console.log(`   ⚠️  Club members table may not exist`);
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
    
    if (fixedCount > 0) {
      console.log('\n🎉 RANK APPROVAL ISSUES FIXED!');
      console.log('👥 Affected users should now see:');
      console.log('   - Updated rank in their profile');
      console.log('   - SPA points in their wallet');
      console.log('   - Updated player rankings');
    }
    
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
      verifyRequests.forEach((req, index) => {
        const isFixed = req.profiles.verified_rank === req.requested_rank;
        console.log(`   ${index + 1}. ${req.profiles.display_name}: ${req.requested_rank} | ${isFixed ? '✅ FIXED' : '❌ STILL BROKEN'}`);
      });
    }
    
    console.log('\n✅ MANUAL FIX COMPLETED');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Manual fix failed:', error.message);
  }
}

function calculateSpaReward(rank) {
  switch (rank) {
    case 'E+': case 'E': return 300;
    case 'F+': case 'F': return 250;
    case 'G+': case 'G': return 200;
    case 'H+': case 'H': return 150;
    case 'I+': case 'I': return 120;
    case 'K+': case 'K': return 100;
    default: return 100;
  }
}

// Run the manual fix
manualFixApprovedRequests();
