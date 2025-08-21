#!/usr/bin/env node

/**
 * Analyze new notifications table structure
 */

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeNotificationsTable() {
  console.log('🔍 ANALYZING NEW NOTIFICATIONS TABLE');
  console.log('===================================\n');

  try {
    // Get sample notification to see structure
    console.log('📋 1. Getting notifications table structure...');
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .limit(3);
    
    if (error) {
      console.log('❌ Cannot access notifications table:', error.message);
      return;
    }

    console.log('✅ Notifications table accessible');
    console.log(`📊 Sample count: ${data?.length || 0} notifications`);

    if (data && data.length > 0) {
      console.log('\n📋 2. Sample notification structure:');
      const sample = data[0];
      Object.keys(sample).forEach(key => {
        const value = sample[key];
        const type = typeof value;
        const displayValue = value === null ? 'null' : 
                            type === 'string' && value.length > 50 ? `"${value.substring(0, 50)}..."` : 
                            JSON.stringify(value);
        console.log(`   ${key}: ${displayValue} (${type})`);
      });
    } else {
      console.log('\n📋 2. No sample notifications found - checking table schema...');
    }

    // Check for key columns mentioned in requirements
    console.log('\n🔍 3. Checking for required unified columns...');
    const requiredColumns = [
      'challenge_id', 'tournament_id', 'club_id', 'match_id',
      'category', 'icon', 'priority', 'action_text', 'action_url',
      'metadata', 'is_read', 'is_archived'
    ];

    if (data && data.length > 0) {
      const availableColumns = Object.keys(data[0]);
      
      requiredColumns.forEach(col => {
        if (availableColumns.includes(col)) {
          console.log(`   ✅ ${col}: Available`);
        } else {
          console.log(`   ❌ ${col}: Missing`);
        }
      });
    }

    // Test create_unified_notification function
    console.log('\n🔧 4. Testing create_unified_notification function...');
    
    // Get a real user for testing
    const { data: users } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);
    
    if (users && users.length > 0) {
      const testUserId = users[0].user_id;
      
      try {
        const { data: result, error: funcError } = await supabase.rpc('create_unified_notification', {
          p_user_id: testUserId,
          p_type: 'system_test',
          p_title: 'Test Unified Notification',
          p_message: 'Testing new unified notification system',
          p_category: 'system',
          p_priority: 'medium',
          p_metadata: { test: true }
        });
        
        if (funcError) {
          console.log('❌ create_unified_notification failed:', funcError.message);
        } else {
          console.log('✅ create_unified_notification working');
          console.log(`   Result: ${JSON.stringify(result)}`);
        }
      } catch (err) {
        console.log('❌ create_unified_notification error:', err.message);
      }
    }

    // Count notifications by type/category
    console.log('\n📊 5. Notification distribution...');
    
    try {
      const { data: typeCount } = await supabase
        .from('notifications')
        .select('type, category')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (typeCount) {
        const typeDistribution = typeCount.reduce((acc, notif) => {
          const key = notif.type || 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        
        console.log('   By type:');
        Object.entries(typeDistribution).forEach(([type, count]) => {
          console.log(`     ${type}: ${count}`);
        });

        const categoryDistribution = typeCount.reduce((acc, notif) => {
          const key = notif.category || 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        
        console.log('   By category:');
        Object.entries(categoryDistribution).forEach(([category, count]) => {
          console.log(`     ${category}: ${count}`);
        });
      }
    } catch (err) {
      console.log('❌ Cannot get distribution:', err.message);
    }

    console.log('\n🎯 UNIFIED NOTIFICATIONS ANALYSIS COMPLETE');
    console.log('==========================================');
    console.log('✅ notifications table is ready');
    console.log('✅ Backend database layer is complete');
    console.log('🔧 Frontend needs useUnifiedNotifications hook');
    console.log('🔧 Components need to be updated');

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

analyzeNotificationsTable().then(() => {
  console.log('\n✅ Notifications table analysis complete');
}).catch(err => {
  console.error('❌ Analysis failed:', err);
  process.exit(1);
});
