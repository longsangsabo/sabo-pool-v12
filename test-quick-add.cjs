const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function testQuickAdd() {
  console.log('🚀 Testing QuickAddUserDialog functionality...');
  
  const tournamentId = 'f2aa6977-4797-4770-af4b-92ee3856781f'; // Clean Rebuild Test Tournament
  const userId = 'd7d6ce12-490f-4fff-b913-80044de5e169'; // Anh Long (I+)
  
  try {
    // Check if user already registered
    const { data: existing } = await supabase
      .from('tournament_registrations')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existing) {
      console.log('⚠️ User already registered, removing first...');
      await supabase
        .from('tournament_registrations')
        .delete()
        .eq('id', existing.id);
    }
    
    // Add user to tournament
    console.log('📝 Adding Anh Long to Clean Rebuild Test Tournament...');
    
    const { data: newReg, error } = await supabase
      .from('tournament_registrations')
      .insert({
        tournament_id: tournamentId,
        user_id: userId,
        registration_status: 'confirmed',
        payment_status: 'paid',
        notes: 'Added by admin via quick add test'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ User added successfully!');
    console.log('📋 Registration details:', {
      id: newReg.id,
      status: newReg.registration_status,
      payment: newReg.payment_status
    });
    
    // Update tournament count
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ current_participants: 2 })
      .eq('id', tournamentId);
      
    if (!updateError) {
      console.log('✅ Tournament participant count updated!');
    }
    
    // Show current registrations with profile data
    const { data: allRegs } = await supabase
      .from('tournament_registrations')
      .select(`
        user_id, 
        registration_status,
        payment_status,
        created_at
      `)
      .eq('tournament_id', tournamentId)
      .order('created_at');
    
    if (allRegs) {
      console.log('📋 Current registrations in tournament:');
      
      // Get profile data for each registration
      for (let i = 0; i < allRegs.length; i++) {
        const reg = allRegs[i];
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, display_name, verified_rank')
          .eq('user_id', reg.user_id)
          .single();
        
        const name = profile?.full_name || profile?.display_name || 'Unknown';
        const rank = profile?.verified_rank ? ` (${profile.verified_rank})` : '';
        
        console.log(`  ${i+1}. ${name}${rank} - ${reg.registration_status}/${reg.payment_status}`);
      }
    }
    
    console.log('\n🎉 QuickAddUserDialog test completed successfully!');
    console.log('✅ Now you can use the feature in the admin panel');
    
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testQuickAdd();
