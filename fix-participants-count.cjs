const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://igiqzfavlmcijmhqqqra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnaXF6ZmF2bG1jaWptaHFxcXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MjI1NzEsImV4cCI6MjA1MDAwNDU3MX0.8_rJMLFWPwT7CxkOjdV0Y_DaZNs7cW7W3RG1cT5Dm94';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCurrentParticipantsCount() {
  console.log('🔧 Fixing current_participants count...');
  
  try {
    const tournamentId = 'c41300b2-02f2-456a-9d6f-679b59177e8f';
    
    // Count confirmed registrations 
    const { data: confirmedRegs, error: countError } = await supabase
      .from('tournament_registrations')
      .select('user_id')
      .eq('tournament_id', tournamentId)
      .eq('registration_status', 'confirmed');
    
    if (countError) {
      console.error('❌ Error counting confirmed registrations:', countError);
      return;
    }
    
    const confirmedCount = confirmedRegs?.length || 0;
    console.log(`✅ Found ${confirmedCount} confirmed registrations`);
    
    // Update tournament current_participants
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ current_participants: confirmedCount })
      .eq('id', tournamentId);
    
    if (updateError) {
      console.error('❌ Error updating tournament:', updateError);
      return;
    }
    
    console.log(`✅ Updated tournament current_participants to ${confirmedCount}`);
    
    // Verify the update
    const { data: tournament, error: verifyError } = await supabase
      .from('tournaments')
      .select('current_participants, max_participants')
      .eq('id', tournamentId)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }
    
    console.log(`🎯 Verification: ${tournament.current_participants}/${tournament.max_participants}`);
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

fixCurrentParticipantsCount();
