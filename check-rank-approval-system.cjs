#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkRankApprovalSystem() {
  console.log('🔍 CHECKING RANK APPROVAL SYSTEM');
  console.log('=' .repeat(60));
  
  try {
    // 1. Check recent rank requests
    console.log('📋 1. CHECKING RECENT RANK REQUESTS...');
    
    const { data: recentRequests, error: requestsError } = await supabase
      .from('rank_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (requestsError) {
      console.log('❌ Error fetching rank requests:', requestsError.message);
    } else {
      console.log(`✅ Found ${recentRequests.length} recent requests`);
      
      if (recentRequests.length > 0) {
        console.log('\n📊 Recent requests:');
        recentRequests.forEach((req, index) => {
          console.log(`   ${index + 1}. ID: ${req.id.slice(0, 8)}... | User: ${req.user_id.slice(0, 8)}... | Status: ${req.status} | Rank: ${req.requested_rank}`);
          if (req.status === 'approved') {
            console.log(`      ✅ Approved at: ${req.approved_at} by: ${req.approved_by?.slice(0, 8) || 'Unknown'}...`);
          }
        });
      }
    }
    
    // 2. Check if any approved requests but profiles not updated
    console.log('\n📋 2. CHECKING PROFILE UPDATES FOR APPROVED REQUESTS...');
    
    const { data: approvedButNotUpdated, error: checkError } = await supabase
      .from('rank_requests')
      .select(`
        id,
        user_id,
        requested_rank,
        status,
        approved_at,
        profiles!inner(user_id, verified_rank, display_name)
      `)
      .eq('status', 'approved')
      .order('approved_at', { ascending: false })
      .limit(10);
    
    if (checkError) {
      console.log('❌ Error checking approved requests:', checkError.message);
      } else {
        console.log(`✅ Found ${approvedButNotUpdated.length} approved requests`);
        
        let issuesFound = 0;
        if (approvedButNotUpdated.length > 0) {
          console.log('\n📊 Approved requests analysis:');
          approvedButNotUpdated.forEach((req, index) => {
            const profileRank = req.profiles.verified_rank;
            const requestedRank = req.requested_rank;
            const isUpdated = profileRank === requestedRank;
            
            console.log(`   ${index + 1}. ${req.profiles.display_name || 'Unknown'}`);
            console.log(`      Requested: ${requestedRank} | Profile: ${profileRank || 'NULL'} | ${isUpdated ? '✅ UPDATED' : '❌ NOT UPDATED'}`);
            
            if (!isUpdated) {
              issuesFound++;
            }
          });
          
          if (issuesFound > 0) {
            console.log(`\n🚨 FOUND ${issuesFound} APPROVED REQUESTS WITH PROFILE NOT UPDATED!`);
          } else {
            console.log('\n✅ All approved requests have updated profiles');
          }
        }
      }    // 3. Check player_rankings updates
    console.log('\n📋 3. CHECKING PLAYER_RANKINGS UPDATES...');
    
    if (approvedButNotUpdated && approvedButNotUpdated.length > 0) {
      for (const req of approvedButNotUpdated.slice(0, 3)) {
        const { data: playerRanking, error: rankingError } = await supabase
          .from('player_rankings')
          .select('*')
          .eq('user_id', req.user_id)
          .single();
        
        if (rankingError) {
          console.log(`   ❌ ${req.profiles.display_name}: No player_rankings record (${rankingError.message})`);
        } else {
          console.log(`   📊 ${req.profiles.display_name}:`);
          console.log(`      Verified Rank: ${playerRanking.verified_rank || 'NULL'}`);
          console.log(`      SPA Points: ${playerRanking.spa_points || 0}`);
          console.log(`      Updated: ${playerRanking.updated_at}`);
        }
      }
    }
    
    // 4. Check if triggers/functions exist
    console.log('\n📋 4. CHECKING DATABASE FUNCTIONS AND TRIGGERS...');
    
    // Check if trigger function exists
    const { data: triggerFunction, error: triggerError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT routine_name, routine_type
          FROM information_schema.routines 
          WHERE routine_schema = 'public' 
          AND routine_name LIKE '%rank%'
          ORDER BY routine_name;
        `
      });
    
    if (triggerError) {
      console.log('❌ Error checking functions:', triggerError.message);
    } else {
      console.log('✅ Database functions related to rank:');
      if (triggerFunction && triggerFunction.length > 0) {
        triggerFunction.forEach(func => {
          console.log(`   - ${func.routine_name} (${func.routine_type})`);
        });
      } else {
        console.log('   ⚠️  No rank-related functions found');
      }
    }
    
    // Check triggers on rank_requests table
    const { data: triggers, error: triggersError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT trigger_name, event_manipulation, action_timing
          FROM information_schema.triggers 
          WHERE event_object_table = 'rank_requests'
          AND trigger_schema = 'public';
        `
      });
    
    if (triggersError) {
      console.log('❌ Error checking triggers:', triggersError.message);
    } else {
      console.log('\n✅ Triggers on rank_requests table:');
      if (triggers && triggers.length > 0) {
        triggers.forEach(trig => {
          console.log(`   - ${trig.trigger_name} (${trig.action_timing} ${trig.event_manipulation})`);
        });
      } else {
        console.log('   ⚠️  No triggers found on rank_requests table');
      }
    }
    
    // 5. Recommendations
    console.log('\n💡 5. DIAGNOSIS & RECOMMENDATIONS');
    console.log('=' .repeat(50));
    
    if (approvedButNotUpdated && issuesFound > 0) {
      console.log('🚨 ISSUES DETECTED:');
      console.log(`   - ${issuesFound} approved rank requests have not updated profiles`);
      console.log('   - This suggests trigger/function is not working properly');
      
      console.log('\n🔧 RECOMMENDED FIXES:');
      console.log('   1. Check if trigger function exists and is working');
      console.log('   2. Manually run update for affected users');
      console.log('   3. Create/fix automatic trigger for future requests');
      console.log('   4. Test the approval process end-to-end');
    } else {
      console.log('✅ SYSTEM STATUS: GOOD');
      console.log('   - All approved requests have updated profiles');
      console.log('   - Rank approval system appears to be working');
    }
    
    console.log('\n✅ RANK APPROVAL SYSTEM CHECK COMPLETED');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

// Run the check
checkRankApprovalSystem();
