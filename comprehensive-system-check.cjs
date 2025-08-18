const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function comprehensiveSystemCheck() {
  try {
    console.log('=== KIỂM TRA TOÀN DIỆN HỆ THỐNG ===\n');

    // 1. Database Structure Check
    console.log('🔍 1. KIỂM TRA CẤU TRÚC DATABASE');
    console.log('=' * 50);

    const tables = [
      'profiles', 'player_rankings', 'spa_transactions', 
      'milestones', 'player_milestones', 'milestone_events', 
      'milestone_awards', 'rank_requests', 'matches', 
      'tournaments', 'challenges'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    // 2. SPA System Integrity Check
    console.log('\n💰 2. KIỂM TRA TÍNH TOÀN VẸN SPA SYSTEM');
    console.log('=' * 50);

    // Check SPA balance consistency
    const { data: allBalances } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points');

    const { data: allTransactions } = await supabase
      .from('spa_transactions')
      .select('user_id, amount, transaction_type');

    console.log(`📊 Total users with balance: ${allBalances?.length || 0}`);
    console.log(`📊 Total transactions: ${allTransactions?.length || 0}`);

    // Calculate total SPA in system
    const totalSpaInBalances = allBalances?.reduce((sum, user) => sum + (user.spa_points || 0), 0) || 0;
    const totalSpaFromCredits = allTransactions?.filter(t => t.transaction_type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    const totalSpaFromDebits = allTransactions?.filter(t => t.transaction_type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    console.log(`💰 Total SPA in balances: ${totalSpaInBalances}`);
    console.log(`💰 Total SPA from credits: ${totalSpaFromCredits}`);
    console.log(`💰 Total SPA from debits: ${totalSpaFromDebits}`);
    console.log(`💰 Net SPA (credits - debits): ${totalSpaFromCredits - totalSpaFromDebits}`);
    console.log(`💰 Balance discrepancy: ${totalSpaInBalances - (totalSpaFromCredits - totalSpaFromDebits)}`);

    // 3. Milestone System Check
    console.log('\n🏆 3. KIỂM TRA HỆ THỐNG MILESTONE');
    console.log('=' * 50);

    const { data: milestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('is_active', true);

    console.log(`📋 Active milestones: ${milestones?.length || 0}`);

    // Check milestone completion rates
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('user_id, full_name');

    console.log(`👥 Total users: ${allUsers?.length || 0}`);

    if (milestones && allUsers) {
      for (const milestone of milestones) {
        const { data: completions } = await supabase
          .from('player_milestones')
          .select('player_id')
          .eq('milestone_id', milestone.id)
          .eq('is_completed', true);

        const completionRate = ((completions?.length || 0) / allUsers.length * 100).toFixed(1);
        console.log(`  ${milestone.name}: ${completions?.length || 0}/${allUsers.length} (${completionRate}%)`);
      }
    }

    // 4. Check for orphaned records
    console.log('\n🧹 4. KIỂM TRA RECORDS MỒ CÔI');
    console.log('=' * 50);

    // SPA transactions without users
    const { data: orphanedTransactions } = await supabase
      .from('spa_transactions')
      .select('id, user_id')
      .not('user_id', 'in', `(${allUsers?.map(u => `'${u.user_id}'`).join(',') || ''})`);

    console.log(`❌ Orphaned SPA transactions: ${orphanedTransactions?.length || 0}`);

    // Player milestones without users
    const { data: orphanedMilestones } = await supabase
      .from('player_milestones')
      .select('id, player_id')
      .not('player_id', 'in', `(${allUsers?.map(u => `'${u.user_id}'`).join(',') || ''})`);

    console.log(`❌ Orphaned milestone records: ${orphanedMilestones?.length || 0}`);

    // Player rankings without profiles
    const { data: orphanedRankings } = await supabase
      .from('player_rankings')
      .select('user_id')
      .not('user_id', 'in', `(${allUsers?.map(u => `'${u.user_id}'`).join(',') || ''})`);

    console.log(`❌ Orphaned ranking records: ${orphanedRankings?.length || 0}`);

    // 5. Check for missing essential records
    console.log('\n🔍 5. KIỂM TRA RECORDS THIẾU');
    console.log('=' * 50);

    let usersMissingRankings = 0;
    let usersMissingMilestones = 0;

    for (const user of allUsers || []) {
      // Check if user has player_rankings record
      const { data: ranking } = await supabase
        .from('player_rankings')
        .select('user_id')
        .eq('user_id', user.user_id)
        .single();

      if (!ranking) {
        usersMissingRankings++;
      }

      // Check if user has any milestone records
      const { data: milestoneRecords } = await supabase
        .from('player_milestones')
        .select('player_id')
        .eq('player_id', user.user_id)
        .limit(1);

      if (!milestoneRecords || milestoneRecords.length === 0) {
        usersMissingMilestones++;
      }
    }

    console.log(`❌ Users missing player_rankings: ${usersMissingRankings}`);
    console.log(`❌ Users missing milestone records: ${usersMissingMilestones}`);

    // 6. Notification System Check
    console.log('\n🔔 6. KIỂM TRA HỆ THỐNG NOTIFICATION');
    console.log('=' * 50);

    try {
      const { data: notifications } = await supabase
        .from('challenge_notifications')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false });

      console.log(`✅ Recent notifications: ${notifications?.length || 0}`);

      // Check for unread notifications
      const { data: unreadNotifications } = await supabase
        .from('challenge_notifications')
        .select('user_id')
        .eq('is_read', false);

      console.log(`📬 Unread notifications: ${unreadNotifications?.length || 0}`);
    } catch (err) {
      console.log(`❌ Notification system error: ${err.message}`);
    }

    // 7. Edge Functions & Triggers Check
    console.log('\n⚡ 7. KIỂM TRA EDGE FUNCTIONS & TRIGGERS');
    console.log('=' * 50);

    // Test milestone trigger function
    try {
      const { data, error } = await supabase.functions.invoke('milestone-triggers', {
        body: { test: true }
      });

      if (error) {
        console.log(`❌ milestone-triggers: ${error.message}`);
      } else {
        console.log(`✅ milestone-triggers: Available`);
      }
    } catch (err) {
      console.log(`❌ milestone-triggers: ${err.message}`);
    }

    // Test milestone-event function
    try {
      const { data, error } = await supabase.functions.invoke('milestone-event', {
        body: { test: true }
      });

      if (error) {
        console.log(`❌ milestone-event: ${error.message}`);
      } else {
        console.log(`✅ milestone-event: Available`);
      }
    } catch (err) {
      console.log(`❌ milestone-event: ${err.message}`);
    }

    // 8. Recent Activity Check
    console.log('\n📊 8. KIỂM TRA HOẠT ĐỘNG GÀN ĐÂY');
    console.log('=' * 50);

    // Recent SPA transactions
    const { data: recentTransactions } = await supabase
      .from('spa_transactions')
      .select('created_at, amount, source_type')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log(`💳 Recent SPA transactions: ${recentTransactions?.length || 0}`);
    if (recentTransactions && recentTransactions.length > 0) {
      recentTransactions.forEach((t, i) => {
        console.log(`  ${i+1}. ${t.amount} SPA from ${t.source_type} at ${t.created_at.substring(0,19)}`);
      });
    }

    // Recent milestone awards
    const { data: recentAwards } = await supabase
      .from('milestone_awards')
      .select('awarded_at, spa_points_awarded, status')
      .order('awarded_at', { ascending: false })
      .limit(5);

    console.log(`🏆 Recent milestone awards: ${recentAwards?.length || 0}`);
    if (recentAwards && recentAwards.length > 0) {
      recentAwards.forEach((a, i) => {
        console.log(`  ${i+1}. ${a.spa_points_awarded} SPA (${a.status}) at ${a.awarded_at?.substring(0,19)}`);
      });
    }

    // 9. Performance & Scaling Issues
    console.log('\n⚡ 9. KIỂM TRA HIỆU SUẤT & SCALING');
    console.log('=' * 50);

    // Check for large tables
    const { data: transactionCount } = await supabase
      .from('spa_transactions')
      .select('id', { count: 'exact' });

    const { data: milestoneEventCount } = await supabase
      .from('milestone_events')
      .select('id', { count: 'exact' });

    console.log(`📊 SPA transactions count: ${transactionCount?.length || 'Unknown'}`);
    console.log(`📊 Milestone events count: ${milestoneEventCount?.length || 'Unknown'}`);

    // Check for potential issues
    console.log('\n🚨 10. PHÁT HIỆN VẤN ĐỀ CẦN FIX');
    console.log('=' * 50);

    const issues = [];
    const recommendations = [];

    // Analyze findings
    if (usersMissingRankings > 0) {
      issues.push(`${usersMissingRankings} users missing player_rankings records`);
      recommendations.push('Create missing player_rankings records');
    }

    if (usersMissingMilestones > 0) {
      issues.push(`${usersMissingMilestones} users missing milestone initialization`);
      recommendations.push('Initialize milestones for new users');
    }

    if (orphanedTransactions && orphanedTransactions.length > 0) {
      issues.push(`${orphanedTransactions.length} orphaned SPA transactions`);
      recommendations.push('Clean up orphaned transaction records');
    }

    if (Math.abs(totalSpaInBalances - (totalSpaFromCredits - totalSpaFromDebits)) > 100) {
      issues.push('SPA balance discrepancy detected');
      recommendations.push('Reconcile SPA balances with transaction history');
    }

    if (issues.length === 0) {
      console.log('🎉 NO CRITICAL ISSUES FOUND!');
      console.log('✅ System appears to be running smoothly');
    } else {
      console.log(`❌ Found ${issues.length} issues:`);
      issues.forEach((issue, i) => {
        console.log(`  ${i+1}. ${issue}`);
      });

      console.log('\n💡 RECOMMENDATIONS:');
      recommendations.forEach((rec, i) => {
        console.log(`  ${i+1}. ${rec}`);
      });
    }

    console.log('\n' + '=' * 60);
    console.log('📋 COMPREHENSIVE SYSTEM CHECK COMPLETED');
    console.log('=' * 60);

  } catch (error) {
    console.error('❌ System check error:', error);
  }
}

comprehensiveSystemCheck();
