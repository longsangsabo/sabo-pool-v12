const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function temporaryFixRLS() {
  console.log('⚠️  TEMPORARY FIX: Making tournament_registrations more permissive...');
  
  try {
    // Test current admin user and ensure they have admin permissions
    const adminUserId = 'd7d6ce12-490f-4fff-b913-80044de5e169';
    
    console.log('1. Ensuring admin user has proper permissions...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_admin: true,
        role: 'admin' // Also set role to admin
      })
      .eq('user_id', adminUserId);
    
    if (updateError) {
      console.error('❌ Error updating admin status:', updateError);
    } else {
      console.log('✅ Admin status confirmed');
    }
    
    // Test if we can create a registration with service role
    console.log('\\n2. Testing registration creation...');
    const testRegistration = {
      tournament_id: 'f2aa6977-4797-4770-af4b-92ee3856781f',
      user_id: '0e541971-640e-4a5e-881b-b7f98a2904f7', // Đặng Linh Hải
      registration_status: 'confirmed',
      payment_status: 'paid',
      notes: 'Test registration via service role'
    };
    
    const { data: newReg, error: insertError } = await supabase
      .from('tournament_registrations')
      .insert(testRegistration)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
    } else {
      console.log('✅ Registration created successfully:', newReg.id);
    }
    
    console.log('\n📋 Current registrations in test tournament:');
    const { data: allRegs } = await supabase
      .from('tournament_registrations')
      .select(`
        id,
        user_id,
        registration_status,
        profiles:user_id(full_name)
      `)
      .eq('tournament_id', 'f2aa6977-4797-4770-af4b-92ee3856781f');
    
    if (allRegs) {
      allRegs.forEach((reg, i) => {
        console.log(`  ${i+1}. ${reg.profiles?.full_name || 'Unknown'} - ${reg.registration_status}`);
      });
    }
    
    console.log('\\n🎯 Next Steps:');
    console.log('1. Try the QuickAddUserDialog again in the web interface');
    console.log('2. Check the browser console for detailed error messages');
    console.log('3. If still issues, we may need to update RLS policies in Supabase Dashboard');
    
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

temporaryFixRLS();
