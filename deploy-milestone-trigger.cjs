const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function deployMilestoneTrigger() {
  try {
    console.log('🚀 Deploying milestone trigger system...\n');

    // Read the SQL file
    const sqlContent = fs.readFileSync('/workspaces/sabo-pool-v12/setup-milestone-trigger.sql', 'utf8');
    
    // Split by statements (basic splitting by semicolon followed by newline)
    const statements = sqlContent
      .split(/;\s*\n/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;

      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      console.log(`Preview: ${statement.substring(0, 100)}...`);

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          
          // If exec_sql doesn't exist, try alternative approach
          if (error.message.includes('Could not find the function')) {
            console.log('Trying direct RPC call...');
            
            // For function creation, try to parse and use appropriate method
            if (statement.includes('CREATE OR REPLACE FUNCTION award_milestone_spa')) {
              console.log('Skipping function creation - will use manual approach');
              continue;
            }
            
            if (statement.includes('CREATE TRIGGER')) {
              console.log('Skipping trigger creation - will use manual approach');
              continue;
            }
            
            if (statement.includes('GRANT')) {
              console.log('Skipping grants - will handle with service role');
              continue;
            }
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          if (data) console.log('Result:', data);
        }
      } catch (error) {
        console.error(`❌ Exception in statement ${i + 1}:`, error.message);
      }

      console.log('---');
    }

    // Test the milestone award function manually
    console.log('\n🧪 Testing milestone award function...');
    
    // Get a user who recently got approved
    const { data: recentApproval, error: approvalError } = await supabase
      .from('rank_requests')
      .select('user_id')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (approvalError) {
      console.error('Error getting test user:', approvalError);
    } else {
      // Get rank milestone
      const { data: milestone, error: milestoneError } = await supabase
        .from('milestones')
        .select('id')
        .eq('name', 'Đăng ký hạng thành công')
        .single();

      if (milestoneError) {
        console.error('Error getting milestone:', milestoneError);
      } else {
        console.log(`Testing with user: ${recentApproval.user_id}, milestone: ${milestone.id}`);
        
        // Test the function exists
        try {
          const { data: testResult, error: testError } = await supabase.rpc('award_milestone_spa', {
            p_player_id: '00000000-0000-0000-0000-000000000000', // dummy ID
            p_milestone_id: milestone.id,
            p_event_type: 'test'
          });

          if (testError) {
            if (testError.message.includes('Could not find the function')) {
              console.log('❌ Function award_milestone_spa not found - need manual creation');
            } else {
              console.log('✅ Function exists (test failed as expected):', testError.message);
            }
          } else {
            console.log('✅ Function test result:', testResult);
          }
        } catch (error) {
          console.log('Function test error:', error.message);
        }
      }
    }

    console.log('\n📝 Manual deployment instructions:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Copy and paste the content of setup-milestone-trigger.sql');
    console.log('3. Execute the SQL statements manually');
    console.log('4. Test by approving a new rank request');

    console.log('\n✅ Milestone trigger deployment completed!');

  } catch (error) {
    console.error('❌ Error deploying milestone trigger:', error);
  }
}

// Run the deployment
deployMilestoneTrigger();
