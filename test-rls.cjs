const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function testCurrentRLS() {
  console.log('🧪 Testing current RLS policies...');
  
  try {
    // Test 1: Check if we can read existing registrations
    console.log('1. Testing read access...');
    const { data: registrations, error: readError } = await supabase
      .from('tournament_registrations')
      .select('*')
      .limit(3);
    
    if (readError) {
      console.error('❌ Read error:', readError);
    } else {
      console.log('✅ Read successful:', registrations.length, 'registrations found');
    }
    
    // Test 2: Try to insert a registration (this should fail with current RLS)
    console.log('\\n2. Testing insert access...');
    const testData = {
      tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f',
      user_id: '4bedc2fd-a85d-483d-80e5-c9541d6ecdc2', // Phan Thị Bình
      registration_status: 'confirmed',
      payment_status: 'paid',
      notes: 'Test admin insert'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('tournament_registrations')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ Insert error (expected):', insertError.message);
      console.log('🔍 This confirms we need to fix RLS policies');
    } else {
      console.log('✅ Insert successful (unexpected):', insertResult);
    }
    
    // Test 3: Check admin user status
    console.log('\\n3. Checking admin user status...');
    const adminUserId = 'd7d6ce12-490f-4fff-b913-80044de5e169';
    
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('user_id, full_name, is_admin, role')
      .eq('user_id', adminUserId)
      .single();
    
    if (adminProfile) {
      console.log('Admin user profile:', {
        name: adminProfile.full_name,
        is_admin: adminProfile.is_admin,
        role: adminProfile.role
      });
      
      if (!adminProfile.is_admin) {
        console.log('🔧 Setting admin status...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('user_id', adminUserId);
        
        if (updateError) {
          console.error('❌ Error updating admin status:', updateError);
        } else {
          console.log('✅ Admin status updated');
        }
      }
    }
    
    console.log('\\n📝 Summary:');
    console.log('- The RLS policy needs to be updated in Supabase Dashboard');
    console.log('- Go to: Database > tournament_registrations > RLS');
    console.log('- Add policy: \"Allow admins to manage all registrations\"');
    console.log('- Policy condition: EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)');
    
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testCurrentRLS();
