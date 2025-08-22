#!/usr/bin/env node

/**
 * ANALYZE DUPLICATE RANK NOTIFICATIONS
 * Kiểm tra tại sao user nhận được 2 lần thông báo "Đăng ký hạng thành công"
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 ANALYZING DUPLICATE RANK NOTIFICATIONS...\n');

async function analyzeDuplicateNotifications() {
  try {
    console.log('📊 1. CHECKING RECENT RANK SUCCESS MILESTONES...');
    
    // Kiểm tra các milestone "Đăng ký hạng thành công" gần đây
    const { data: rankMilestones, error: milestonesError } = await supabase
      .from('milestones')
      .select(`
        id,
        user_id,
        title,
        description,
        reward_amount,
        reward_type,
        created_at,
        is_claimed,
        milestone_type
      `)
      .ilike('title', '%Đăng ký hạng thành công%')
      .order('created_at', { ascending: false })
      .limit(20);

    if (milestonesError) {
      console.error('❌ Error fetching milestones:', milestonesError);
      return;
    }

    console.log(`📋 Found ${rankMilestones.length} rank success milestones:\n`);
    
    // Group by user_id để tìm duplicates
    const userMilestones = {};
    rankMilestones.forEach(milestone => {
      if (!userMilestones[milestone.user_id]) {
        userMilestones[milestone.user_id] = [];
      }
      userMilestones[milestone.user_id].push(milestone);
    });

    // Hiển thị users có multiple milestones
    console.log('👥 USERS WITH MULTIPLE RANK SUCCESS MILESTONES:');
    let duplicateFound = false;
    
    for (const [userId, milestones] of Object.entries(userMilestones)) {
      if (milestones.length > 1) {
        duplicateFound = true;
        console.log(`\n🔴 User ID: ${userId} - ${milestones.length} milestones:`);
        
        milestones.forEach((milestone, index) => {
          console.log(`   ${index + 1}. ${milestone.title}`);
          console.log(`      📅 Created: ${new Date(milestone.created_at).toLocaleString()}`);
          console.log(`      💰 Reward: +${milestone.reward_amount} ${milestone.reward_type}`);
          console.log(`      🎯 Type: ${milestone.milestone_type || 'N/A'}`);
          console.log(`      ✅ Claimed: ${milestone.is_claimed ? 'Yes' : 'No'}`);
          console.log(`      🆔 ID: ${milestone.id}\n`);
        });
      }
    }

    if (!duplicateFound) {
      console.log('✅ No users with duplicate rank success milestones found.\n');
    }

    console.log('📊 2. CHECKING RANK REQUESTS HISTORY...');
    
    // Kiểm tra rank requests để hiểu pattern
    const { data: rankRequests, error: requestsError } = await supabase
      .from('rank_requests')
      .select(`
        id,
        user_id,
        requested_rank,
        current_rank,
        status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .limit(30);

    if (requestsError) {
      console.error('❌ Error fetching rank requests:', requestsError);
      return;
    }

    console.log(`📋 Found ${rankRequests.length} recent rank requests:\n`);

    // Group rank requests by user
    const userRequests = {};
    rankRequests.forEach(request => {
      if (!userRequests[request.user_id]) {
        userRequests[request.user_id] = [];
      }
      userRequests[request.user_id].push(request);
    });

    // Tìm users với multiple approved requests
    console.log('👥 USERS WITH MULTIPLE RANK REQUESTS:');
    let multipleRequestsFound = false;
    
    for (const [userId, requests] of Object.entries(userRequests)) {
      if (requests.length > 1) {
        multipleRequestsFound = true;
        const approvedRequests = requests.filter(r => r.status === 'approved');
        
        if (approvedRequests.length > 1) {
          console.log(`\n🔴 User ID: ${userId} - ${approvedRequests.length} APPROVED requests:`);
          
          approvedRequests.forEach((request, index) => {
            console.log(`   ${index + 1}. ${request.current_rank} → ${request.requested_rank}`);
            console.log(`      📅 Created: ${new Date(request.created_at).toLocaleString()}`);
            console.log(`      📅 Updated: ${new Date(request.updated_at).toLocaleString()}`);
            console.log(`      🆔 ID: ${request.id}\n`);
          });
        }
      }
    }

    if (!multipleRequestsFound) {
      console.log('✅ No users with multiple approved rank requests found.\n');
    }

    console.log('📊 3. CHECKING MILESTONE CREATION TRIGGERS...');
    
    // Kiểm tra functions và triggers có thể tạo duplicate milestones
    const { data: functions, error: functionsError } = await supabase
      .rpc('get_functions_list');

    if (!functionsError && functions) {
      console.log('📋 Database Functions Related to Milestones:');
      functions.forEach(func => {
        if (func.routine_name.includes('milestone') || 
            func.routine_name.includes('rank') || 
            func.routine_name.includes('reward')) {
          console.log(`   🔧 ${func.routine_name}`);
        }
      });
    }

    console.log('\n📊 4. CHECKING FOR TIMING ISSUES...');
    
    // Kiểm tra milestone timing patterns
    if (rankMilestones.length > 0) {
      console.log('⏰ Recent milestone creation timeline:');
      rankMilestones.slice(0, 10).forEach((milestone, index) => {
        const timeDiff = index > 0 ? 
          new Date(rankMilestones[index-1].created_at) - new Date(milestone.created_at) : 0;
        
        console.log(`   ${index + 1}. ${new Date(milestone.created_at).toLocaleString()}`);
        console.log(`      👤 User: ${milestone.user_id}`);
        console.log(`      💰 Reward: +${milestone.reward_amount} ${milestone.reward_type}`);
        if (timeDiff > 0) {
          console.log(`      ⏱️  Time gap: ${Math.round(timeDiff / 1000)}s from previous`);
        }
        console.log('');
      });
    }

    console.log('📊 5. CHECKING MILESTONE SOURCES...');
    
    // Kiểm tra có duplicate milestone creation không
    const duplicateCheck = `
      SELECT 
        user_id,
        title,
        reward_amount,
        reward_type,
        COUNT(*) as count,
        array_agg(id ORDER BY created_at) as milestone_ids,
        array_agg(created_at ORDER BY created_at) as creation_times
      FROM milestones 
      WHERE title ILIKE '%Đăng ký hạng thành công%'
      GROUP BY user_id, title, reward_amount, reward_type
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC;
    `;

    const { data: duplicates, error: duplicatesError } = await supabase
      .rpc('execute_sql', { query: duplicateCheck });

    if (!duplicatesError && duplicates && duplicates.length > 0) {
      console.log('🔴 FOUND EXACT DUPLICATE MILESTONES:');
      duplicates.forEach(dup => {
        console.log(`\n👤 User ID: ${dup.user_id}`);
        console.log(`📝 Title: ${dup.title}`);
        console.log(`🔢 Count: ${dup.count} identical milestones`);
        console.log(`🆔 IDs: ${dup.milestone_ids.join(', ')}`);
        console.log(`📅 Times: ${dup.creation_times.map(t => new Date(t).toLocaleString()).join(' | ')}`);
      });
    } else {
      console.log('✅ No exact duplicate milestones found.\n');
    }

    console.log('📊 6. ANALYZING POTENTIAL CAUSES...');
    
    console.log(`
🔍 POTENTIAL CAUSES FOR DUPLICATE NOTIFICATIONS:

1. 🔄 **Multiple Trigger Executions:**
   - Rank approval trigger firing multiple times
   - Race conditions in database updates
   - Frontend multiple API calls

2. ⚡ **Timing Issues:**
   - Rapid successive rank requests
   - Multiple browser tabs/sessions
   - Network retry mechanisms

3. 🔧 **Code Logic Issues:**
   - Multiple milestone creation paths
   - Insufficient duplicate checking
   - Missing unique constraints

4. 🗄️ **Database Issues:**
   - Transaction isolation problems
   - Trigger recursion
   - Missing idempotency keys

📋 RECOMMENDATIONS:

1. ✅ **Add Unique Constraints:**
   \`ALTER TABLE milestones ADD CONSTRAINT unique_user_rank_milestone 
   UNIQUE (user_id, milestone_type, title);\`

2. 🔧 **Implement Idempotency:**
   - Add unique key checks before milestone creation
   - Use UPSERT instead of INSERT for milestones

3. ⚡ **Fix Race Conditions:**
   - Add proper transaction isolation
   - Implement mutex/locking for rank processing

4. 🧪 **Add Debugging:**
   - Log all milestone creation attempts
   - Track trigger execution timestamps
   - Monitor API call patterns
    `);

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run analysis
analyzeDuplicateNotifications();
