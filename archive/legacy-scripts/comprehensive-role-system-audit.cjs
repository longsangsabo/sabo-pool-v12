#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://exlqvlbawytbglioqfbc.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE0NzI1NDIsImV4cCI6MjAzNzA0ODU0Mn0.2OZ0UpJPKFYS_lU9PbzHaT5nz14oF0BmgAfJyFLmTyY'
);

async function comprehensiveRoleAudit() {
  console.log('🔍 COMPREHENSIVE ROLE SYSTEM AUDIT');
  console.log('=' .repeat(60));
  console.log(`📅 Date: ${new Date().toISOString()}`);
  
  try {
    // 1. KIỂM TRA CẤU TRÚC DATABASE
    console.log('\n📊 1. DATABASE STRUCTURE ANALYSIS');
    console.log('=' .repeat(50));
    
    // Check user_roles table
    const { data: userRolesData, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);
    
    console.log(`   ✅ user_roles table: ${userRolesError ? '❌ NOT ACCESSIBLE' : '✅ ACCESSIBLE'}`);
    if (userRolesError) {
      console.log(`      Error: ${userRolesError.message}`);
    }
    
    // Check profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, is_admin')
      .limit(1);
    
    console.log(`   ✅ profiles table: ${profilesError ? '❌ NOT ACCESSIBLE' : '✅ ACCESSIBLE'}`);
    if (profilesError) {
      console.log(`      Error: ${profilesError.message}`);
    }
    
    // 2. KIỂM TRA DATABASE FUNCTIONS
    console.log('\n📊 2. DATABASE FUNCTIONS CHECK');
    console.log('=' .repeat(50));
    
    const testUserId = 'd7d6ce12-490f-4fff-b913-80044de5e169'; // Test user ID
    
    // Test get_user_roles function
    const { data: rolesData, error: rolesError } = await supabase
      .rpc('get_user_roles', { _user_id: testUserId });
    
    console.log(`   🔧 get_user_roles(): ${rolesError ? '❌ ERROR' : '✅ WORKING'}`);
    if (rolesError) {
      console.log(`      Error: ${rolesError.message}`);
    } else {
      console.log(`      Test result: [${rolesData?.join(', ') || 'none'}]`);
    }
    
    // Test user_has_role function
    const { data: hasAdminRole, error: hasRoleError } = await supabase
      .rpc('user_has_role', { _user_id: testUserId, _role: 'admin' });
    
    console.log(`   🔧 user_has_role(): ${hasRoleError ? '❌ ERROR' : '✅ WORKING'}`);
    if (hasRoleError) {
      console.log(`      Error: ${hasRoleError.message}`);
    } else {
      console.log(`      Test result: ${hasAdminRole}`);
    }
    
    // Test get_user_primary_role function
    const { data: primaryRole, error: primaryError } = await supabase
      .rpc('get_user_primary_role', { _user_id: testUserId });
    
    console.log(`   🔧 get_user_primary_role(): ${primaryError ? '❌ ERROR' : '✅ WORKING'}`);
    if (primaryError) {
      console.log(`      Error: ${primaryError.message}`);
    } else {
      console.log(`      Test result: ${primaryRole}`);
    }
    
    // 3. ROLE DISTRIBUTION ANALYSIS
    console.log('\n📊 3. ROLE DISTRIBUTION ANALYSIS');
    console.log('=' .repeat(50));
    
    if (!userRolesError) {
      const { data: allRoles, error } = await supabase
        .from('user_roles')
        .select('role');
      
      if (!error && allRoles) {
        const roleStats = {};
        allRoles.forEach(r => {
          roleStats[r.role] = (roleStats[r.role] || 0) + 1;
        });
        
        console.log(`   📈 Total role assignments: ${allRoles.length}`);
        console.log('   📊 Role distribution:');
        Object.entries(roleStats).forEach(([role, count]) => {
          console.log(`      - ${role}: ${count} users`);
        });
      }
    }
    
    // 4. ADMIN USERS COMPARISON
    console.log('\n📊 4. ADMIN USERS COMPARISON (OLD vs NEW)');
    console.log('=' .repeat(50));
    
    // Old system (profiles.is_admin)
    if (!profilesError) {
      const { data: oldAdmins, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, is_admin')
        .eq('is_admin', true);
      
      if (!error && oldAdmins) {
        console.log(`   👑 OLD system (profiles.is_admin): ${oldAdmins.length} admins`);
        oldAdmins.forEach(admin => {
          console.log(`      - ${admin.display_name || 'Unknown'} (${admin.user_id.slice(0, 8)}...)`);
        });
      }
    }
    
    // New system (user_roles)
    if (!userRolesError) {
      const { data: newAdmins, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles!inner(display_name)
        `)
        .eq('role', 'admin');
      
      if (!error && newAdmins) {
        console.log(`   🔐 NEW system (user_roles): ${newAdmins.length} admins`);
        newAdmins.forEach(admin => {
          console.log(`      - ${admin.profiles.display_name || 'Unknown'} (${admin.user_id.slice(0, 8)}...)`);
        });
      }
    }
    
    // 5. FRONTEND CODE ANALYSIS
    console.log('\n📊 5. FRONTEND CODE ANALYSIS');
    console.log('=' .repeat(50));
    
    // Check useRoles hook
    const useRolesPath = '/workspaces/sabo-pool-v12/src/hooks/useRoles.ts';
    const useRolesExists = fs.existsSync(useRolesPath);
    console.log(`   🎣 useRoles hook: ${useRolesExists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    // Check AdminRoute component
    const adminRoutePath = '/workspaces/sabo-pool-v12/src/components/auth/AdminRoute.tsx';
    const adminRouteExists = fs.existsSync(adminRoutePath);
    console.log(`   🛡️  AdminRoute component: ${adminRouteExists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (adminRouteExists) {
      const adminRouteContent = fs.readFileSync(adminRoutePath, 'utf8');
      const hasHardcodedEmail = adminRouteContent.includes('longsangsabo@gmail.com') || 
                               adminRouteContent.includes('longsang063@gmail.com');
      const usesOldSystem = adminRouteContent.includes('profiles.is_admin');
      const usesNewSystem = adminRouteContent.includes('useAdminCheck');
      
      console.log(`      🔒 Hardcoded email bypass: ${hasHardcodedEmail ? '❌ PRESENT (SECURITY RISK!)' : '✅ REMOVED'}`);
      console.log(`      📊 Uses old system: ${usesOldSystem ? '❌ YES' : '✅ NO'}`);
      console.log(`      🔧 Uses new system: ${usesNewSystem ? '✅ YES' : '❌ NO'}`);
    }
    
    // Check RoleRoute component
    const roleRoutePath = '/workspaces/sabo-pool-v12/src/components/auth/RoleRoute.tsx';
    const roleRouteExists = fs.existsSync(roleRoutePath);
    console.log(`   🎭 RoleRoute component: ${roleRouteExists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    // 6. SECURITY ASSESSMENT
    console.log('\n📊 6. SECURITY ASSESSMENT');
    console.log('=' .repeat(50));
    
    const securityIssues = [];
    
    if (adminRouteExists) {
      const adminRouteContent = fs.readFileSync(adminRoutePath, 'utf8');
      if (adminRouteContent.includes('longsangsabo@gmail.com') || 
          adminRouteContent.includes('longsang063@gmail.com')) {
        securityIssues.push('Hardcoded email bypass in AdminRoute');
      }
      if (adminRouteContent.includes('profiles.is_admin')) {
        securityIssues.push('AdminRoute uses old profiles.is_admin field');
      }
    }
    
    if (rolesError || hasRoleError || primaryError) {
      securityIssues.push('Database role functions not working properly');
    }
    
    if (securityIssues.length === 0) {
      console.log('   ✅ NO CRITICAL SECURITY ISSUES DETECTED');
    } else {
      console.log('   🚨 CRITICAL SECURITY ISSUES FOUND:');
      securityIssues.forEach((issue, index) => {
        console.log(`      ${index + 1}. ❌ ${issue}`);
      });
    }
    
    // 7. RECOMMENDATIONS
    console.log('\n💡 7. RECOMMENDATIONS');
    console.log('=' .repeat(50));
    
    if (securityIssues.length > 0) {
      console.log('   🔥 IMMEDIATE ACTION REQUIRED:');
      console.log('   1. 🔧 Deploy database role functions if not working');
      console.log('   2. 🔒 Remove any hardcoded email bypasses');
      console.log('   3. 🔄 Update all components to use new role system');
      console.log('   4. 🧪 Test role-based access thoroughly');
    } else {
      console.log('   ✅ SYSTEM STATUS: GOOD');
      console.log('   📋 OPTIONAL IMPROVEMENTS:');
      console.log('   1. 📊 Add admin panel for role management');
      console.log('   2. 📝 Add audit logging for role changes');
      console.log('   3. 🔄 Implement real-time role updates');
      console.log('   4. 🛡️  Add API-level role validation');
    }
    
    // 8. SYSTEM HEALTH SCORE
    console.log('\n📊 8. SYSTEM HEALTH SCORE');
    console.log('=' .repeat(50));
    
    let score = 100;
    let scoreBreakdown = [];
    
    if (userRolesError) {
      score -= 25;
      scoreBreakdown.push('user_roles table inaccessible (-25)');
    }
    
    if (rolesError || hasRoleError || primaryError) {
      score -= 25;
      scoreBreakdown.push('Database functions not working (-25)');
    }
    
    if (securityIssues.includes('Hardcoded email bypass in AdminRoute')) {
      score -= 30;
      scoreBreakdown.push('Security vulnerability present (-30)');
    }
    
    if (securityIssues.includes('AdminRoute uses old profiles.is_admin field')) {
      score -= 15;
      scoreBreakdown.push('Using outdated system (-15)');
    }
    
    if (!useRolesExists) {
      score -= 10;
      scoreBreakdown.push('Missing useRoles hook (-10)');
    }
    
    const getScoreColor = (score) => {
      if (score >= 90) return '🟢';
      if (score >= 70) return '🟡';
      if (score >= 50) return '🟠';
      return '🔴';
    };
    
    console.log(`   ${getScoreColor(score)} OVERALL HEALTH SCORE: ${score}/100`);
    
    if (scoreBreakdown.length > 0) {
      console.log('   📋 Score breakdown:');
      scoreBreakdown.forEach(item => {
        console.log(`      - ${item}`);
      });
    }
    
    console.log('\n✅ AUDIT COMPLETE');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
  }
}

// Run the audit
comprehensiveRoleAudit();
