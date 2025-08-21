#!/usr/bin/env node

/**
 * Milestone System Service Test
 * Tests milestone service functionality end-to-end
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMilestoneSystem() {
  console.log('🧪 MILESTONE SYSTEM TEST SUITE');
  console.log('===============================\n');

  try {
    // Test 1: Check table existence
    console.log('📋 Test 1: Database Tables');
    console.log('---------------------------');
    
    const tables = ['milestones', 'player_milestones', 'milestone_events', 'milestone_awards'];
    const tableResults = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('id').limit(1);
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
          tableResults[table] = false;
        } else {
          console.log(`✅ Table '${table}': Available`);
          tableResults[table] = true;
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
        tableResults[table] = false;
      }
    }

    // Test 2: Check functions
    console.log('\n🔧 Test 2: Database Functions');
    console.log('------------------------------');
    
    const functions = [
      'get_user_milestone_progress',
      'create_challenge_notification',
      'get_user_milestone_stats',
      'initialize_user_milestones'
    ];
    
    for (const func of functions) {
      try {
        // Test with dummy UUID to check if function exists
        const testUserId = '00000000-0000-0000-0000-000000000000';
        const { error } = await supabase.rpc(func, { p_user_id: testUserId });
        
        if (error && error.code === '42883') {
          console.log(`❌ Function '${func}': Not found`);
        } else {
          console.log(`✅ Function '${func}': Available`);
        }
      } catch (err) {
        console.log(`❌ Function '${func}': ${err.message}`);
      }
    }

    // Test 3: Check milestone data
    console.log('\n📊 Test 3: Milestone Data');
    console.log('-------------------------');
    
    if (tableResults.milestones) {
      const { data: milestones, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('is_active', true);
        
      if (error) {
        console.log(`❌ Milestone data: ${error.message}`);
      } else {
        console.log(`✅ Active milestones: ${milestones?.length || 0}`);
        
        if (milestones && milestones.length > 0) {
          // Group by category
          const categories = milestones.reduce((acc, m) => {
            acc[m.category] = (acc[m.category] || 0) + 1;
            return acc;
          }, {});
          
          Object.entries(categories).forEach(([category, count]) => {
            console.log(`   └─ ${category}: ${count} milestones`);
          });
        } else {
          console.log('⚠️  No milestone data found - system needs seeding');
        }
      }
    }

    // Test 4: Test milestone service methods (if available)
    console.log('\n🔄 Test 4: Service Integration');
    console.log('------------------------------');
    
    // Test get_user_milestone_progress function
    try {
      const testUserId = '00000000-0000-0000-0000-000000000000';
      const { data, error } = await supabase.rpc('get_user_milestone_progress', {
        p_user_id: testUserId
      });
      
      if (error) {
        console.log(`❌ get_user_milestone_progress: ${error.message}`);
        
        // If schema cache issue, suggest refresh
        if (error.message.includes('schema cache')) {
          console.log('   💡 Suggestion: Run fix-milestone-schema-cache.sql to refresh schema');
        }
      } else {
        console.log(`✅ get_user_milestone_progress: Returns ${data?.length || 0} records`);
        
        if (data && data.length > 0) {
          const completed = data.filter(m => m.is_completed).length;
          console.log(`   └─ ${completed}/${data.length} milestones completed`);
        }
      }
    } catch (err) {
      console.log(`❌ get_user_milestone_progress: ${err.message}`);
    }

    // Test create_challenge_notification function with non-existent user (should handle gracefully)
    try {
      const { data, error } = await supabase.rpc('create_challenge_notification', {
        p_type: 'milestone_unlocked',
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_title: 'Milestone Unlocked!',
        p_message: 'You have unlocked a new milestone'
      });
      
      if (error) {
        console.log(`❌ create_challenge_notification: ${error.message}`);
        
        // Check if it's a foreign key constraint issue
        if (error.message.includes('foreign key constraint')) {
          console.log('   💡 This is expected for non-existent test user');
          console.log('   💡 Function should handle this gracefully after fix');
        }
      } else {
        if (data === null) {
          console.log(`✅ create_challenge_notification: Gracefully handles non-existent user`);
        } else {
          console.log(`✅ create_challenge_notification: Created notification ${data}`);
        }
      }
    } catch (err) {
      console.log(`❌ create_challenge_notification: ${err.message}`);
    }

    // Test initialize_user_milestones function
    try {
      const testUserId = '00000000-0000-0000-0000-000000000000';
      const { data, error } = await supabase.rpc('initialize_user_milestones', {
        p_user_id: testUserId
      });
      
      if (error) {
        console.log(`❌ initialize_user_milestones: ${error.message}`);
      } else {
        console.log(`✅ initialize_user_milestones: Initialized ${data || 0} milestones`);
      }
    } catch (err) {
      console.log(`❌ initialize_user_milestones: ${err.message}`);
    }

    // Test get_user_milestone_stats function
    try {
      const testUserId = '00000000-0000-0000-0000-000000000000';
      const { data, error } = await supabase.rpc('get_user_milestone_stats', {
        p_user_id: testUserId
      });
      
      if (error) {
        console.log(`❌ get_user_milestone_stats: ${error.message}`);
      } else {
        const stats = data?.[0];
        if (stats) {
          console.log(`✅ get_user_milestone_stats: ${stats.completed_milestones}/${stats.total_milestones} completed (${stats.completion_percentage}%)`);
          console.log(`   └─ Total SPA earned: ${stats.total_spa_earned}`);
        } else {
          console.log(`✅ get_user_milestone_stats: Function works (no data for test user)`);
        }
      }
    } catch (err) {
      console.log(`❌ get_user_milestone_stats: ${err.message}`);
    }

    console.log('\n🔗 Test 5: Integration Dependencies');
    console.log('-----------------------------------');
    
    // Check SPA system
    try {
      const { data, error } = await supabase.from('spa_transactions').select('id').limit(1);
      if (error) {
        console.log(`❌ SPA system: ${error.message}`);
      } else {
        console.log(`✅ SPA system: Available`);
      }
    } catch (err) {
      console.log(`❌ SPA system: ${err.message}`);
    }

    // Check notification system
    try {
      const { data, error } = await supabase.from('challenge_notifications').select('id').limit(1);
      if (error) {
        console.log(`❌ Notification system: ${error.message}`);
      } else {
        console.log(`✅ Notification system: Available`);
      }
    } catch (err) {
      console.log(`❌ Notification system: ${err.message}`);
    }

    // Check tournament system integration
    try {
      const { data, error } = await supabase.from('tournament_registrations').select('id').limit(1);
      if (error) {
        console.log(`❌ Tournament system: ${error.message}`);
      } else {
        console.log(`✅ Tournament system: Available`);
      }
    } catch (err) {
      console.log(`❌ Tournament system: ${err.message}`);
    }

    // Check match results integration
    try {
      const { data, error } = await supabase.from('tournament_matches').select('id').limit(1);
      if (error) {
        console.log(`❌ Match system: ${error.message}`);
      } else {
        console.log(`✅ Match system: Available`);
      }
    } catch (err) {
      console.log(`❌ Match system: ${err.message}`);
    }

    // Test 6: Check milestone triggers and automation
    console.log('\n⚡ Test 6: Milestone Automation');
    console.log('-------------------------------');
    
    // Check if there are any triggers for milestone automation
    try {
      // Query PostgreSQL system tables directly (not through Supabase from() interface)
      const { data, error } = await supabase.rpc('exec_sql', {
        query: `
          SELECT trigger_name, event_object_table 
          FROM information_schema.triggers 
          WHERE trigger_name ILIKE '%milestone%'
        `
      });
        
      if (error) {
        console.log(`⚠️  Trigger check: Cannot query system tables (${error.message})`);
        console.log(`   💡 This is normal - checking for milestone automation another way`);
        
        // Alternative: Check if milestone-related functions exist that might be called by triggers
        const { data: funcData, error: funcError } = await supabase
          .from('information_schema.routines')
          .select('routine_name')
          .ilike('routine_name', '%milestone%');
          
        if (!funcError && funcData && funcData.length > 0) {
          console.log(`✅ Milestone functions: Found ${funcData.length} milestone-related functions`);
        } else {
          console.log(`ℹ️  Milestone automation: Manual updates only`);
        }
      } else {
        if (data && data.length > 0) {
          console.log(`✅ Milestone triggers: Found ${data.length} triggers`);
          data.forEach(trigger => {
            console.log(`   └─ ${trigger.trigger_name} on ${trigger.event_object_table}`);
          });
        } else {
          console.log(`ℹ️  No milestone triggers found - manual milestone updates only`);
        }
      }
    } catch (err) {
      console.log(`⚠️  Trigger check: ${err.message}`);
      console.log(`   💡 Manual milestone system - events will be triggered via service calls`);
    }

    // Check milestone events table for recent activity
    try {
      const { data, error } = await supabase
        .from('milestone_events')
        .select('id, event_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.log(`❌ Recent milestone events: ${error.message}`);
      } else {
        if (data && data.length > 0) {
          console.log(`✅ Recent milestone events: ${data.length} events found`);
          data.forEach(event => {
            console.log(`   └─ ${event.event_type} at ${new Date(event.created_at).toLocaleString()}`);
          });
        } else {
          console.log(`ℹ️  No recent milestone events - system ready for first activities`);
        }
      }
    } catch (err) {
      console.log(`❌ Recent milestone events: ${err.message}`);
    }

    console.log('\n🎯 TEST SUMMARY');
    console.log('===============');
    console.log('Tests completed. Check results above for any issues.');
    console.log('If any critical components are missing, run the fix scripts.');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testMilestoneSystem().then(() => {
  console.log('\n✅ Milestone system test completed');
}).catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
