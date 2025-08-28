const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testTriggerByApproval() {
  try {
    console.log('🧪 Testing trigger by creating/approving a rank request...\n');

    // 1. Find pending rank requests
    console.log('1. Looking for pending rank requests...');
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('rank_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    if (pendingError) {
      console.error('Error getting pending requests:', pendingError);
      return;
    }

    console.log(`Found ${pendingRequests.length} pending requests:`);
    pendingRequests.forEach(request => {
      console.log(`- ID: ${request.id}, User: ${request.user_id}, Rank: ${request.rank}`);
    });

    if (pendingRequests.length === 0) {
      console.log('\n📝 No pending requests found. Creating a test scenario...');
      
      // Find a user without rank registration milestone
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .limit(20);

      if (profilesError) {
        console.error('Error getting profiles:', profilesError);
        return;
      }

      let testUser = null;
      for (const profile of profiles) {
        const { data: existingRequest, error: requestError } = await supabase
          .from('rank_requests')
          .select('id')
          .eq('user_id', profile.user_id)
          .eq('status', 'approved')
          .limit(1);

        if (!requestError && existingRequest.length === 0) {
          testUser = profile;
          break;
        }
      }

      if (testUser) {
        console.log(`Creating test rank request for user: ${testUser.display_name}`);
        
        // Create a test rank request
        const { data: newRequest, error: createError } = await supabase
          .from('rank_requests')
          .insert({
            user_id: testUser.user_id,
            rank: 'H+',
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating test request:', createError);
          return;
        }

        console.log('✅ Created test request:', newRequest.id);
        
        // Now approve it to trigger the milestone
        console.log('\n2. Approving the test request to trigger milestone...');
        
        const { data: approvedRequest, error: approveError } = await supabase
          .from('rank_requests')
          .update({ 
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', newRequest.id)
          .select()
          .single();

        if (approveError) {
          console.error('Error approving request:', approveError);
          return;
        }

        console.log('✅ Request approved:', approvedRequest.id);
        
        // Wait a moment for trigger to execute
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if milestone was awarded
        console.log('\n3. Checking if milestone was automatically awarded...');
        
        const { data: newAwards, error: awardsError } = await supabase
          .from('milestone_awards')
          .select('*')
          .eq('player_id', testUser.user_id)
          .eq('event_type', 'rank_registration')
          .gte('awarded_at', newRequest.created_at);

        if (awardsError) {
          console.error('Error checking awards:', awardsError);
        } else {
          if (newAwards.length > 0) {
            console.log('🎉 SUCCESS! Trigger worked automatically!');
            console.log('New milestone award:', newAwards[0]);
            
            // Check SPA points update
            const { data: updatedProfile, error: profileError } = await supabase
              .from('profiles')
              .select('spa_points')
              .eq('user_id', testUser.user_id)
              .single();

            if (!profileError) {
              console.log(`User SPA points: ${updatedProfile.spa_points}`);
            }
          } else {
            console.log('❌ Trigger did not fire automatically');
            console.log('The trigger may need manual debugging in Supabase Dashboard');
          }
        }

      } else {
        console.log('❌ No suitable test user found');
      }

    } else {
      // Use existing pending request
      const testRequest = pendingRequests[0];
      console.log(`\nUsing existing pending request: ${testRequest.id}`);
      
      // Check current milestone status
      const { data: currentAwards, error: currentError } = await supabase
        .from('milestone_awards')
        .select('*')
        .eq('player_id', testRequest.user_id)
        .eq('event_type', 'rank_registration');

      if (currentError) {
        console.error('Error checking current awards:', currentError);
        return;
      }

      console.log(`User currently has ${currentAwards.length} rank registration milestones`);

      if (currentAwards.length === 0) {
        console.log('\n2. Approving the request to test trigger...');
        
        const { data: approvedRequest, error: approveError } = await supabase
          .from('rank_requests')
          .update({ 
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', testRequest.id)
          .select()
          .single();

        if (approveError) {
          console.error('Error approving request:', approveError);
          return;
        }

        console.log('✅ Request approved');
        
        // Wait for trigger
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for new milestone
        const { data: newAwards, error: newError } = await supabase
          .from('milestone_awards')
          .select('*')
          .eq('player_id', testRequest.user_id)
          .eq('event_type', 'rank_registration')
          .gte('awarded_at', approvedRequest.updated_at);

        if (newError) {
          console.error('Error checking new awards:', newError);
        } else {
          if (newAwards.length > 0) {
            console.log('🎉 SUCCESS! Automatic trigger worked!');
            console.log('New award:', newAwards[0]);
          } else {
            console.log('❌ Trigger did not work automatically');
          }
        }
      } else {
        console.log('❌ User already has rank registration milestone');
      }
    }

    console.log('\n✅ Trigger test completed!');

  } catch (error) {
    console.error('❌ Error testing trigger:', error);
  }
}

// Run the trigger test
testTriggerByApproval();
