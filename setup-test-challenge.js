import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function setupTestChallenge() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    process.env.VITE_SUPABASE_ANON_KEY
  );

  try {
    console.log('🔧 Setting up test challenge...');
    
    // First, find accepted challenges
    const { data: acceptedChallenges, error: acceptedError } = await supabase
      .from('challenges')
      .select('id, challenger_id, opponent_id, scheduled_time, status, club_id')
      .eq('status', 'accepted')
      .limit(3);
      
    if (acceptedError) {
      console.error('❌ Error getting accepted challenges:', acceptedError);
      return;
    }
    
    console.log('📋 Found accepted challenges:', acceptedChallenges?.length || 0);
    
    if (!acceptedChallenges || acceptedChallenges.length === 0) {
      console.log('⚠️ No accepted challenges found. Let me check other statuses...');
      
      // Check all challenge statuses
      const { data: allChallenges, error: allError } = await supabase
        .from('challenges')
        .select('id, status, scheduled_time, club_id')
        .limit(10);
        
      if (allError) {
        console.error('❌ Error getting all challenges:', allError);
        return;
      }
      
      const statusCounts = {};
      allChallenges?.forEach(c => {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      });
      
      console.log('📊 Challenge status distribution:', statusCounts);
      
      // If we have challenges, let's work with the first one
      if (allChallenges && allChallenges.length > 0) {
        const testChallenge = allChallenges[0];
        console.log(`🎯 Using challenge ${testChallenge.id} for testing (current status: ${testChallenge.status})`);
        
        // Update it to ongoing with scores
        const { data: updated, error: updateError } = await supabase
          .from('challenges')
          .update({
            status: 'ongoing',
            challenger_score: 9,
            opponent_score: 6,
            scheduled_time: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
          })
          .eq('id', testChallenge.id)
          .select()
          .single();
          
        if (updateError) {
          console.error('❌ Error updating challenge:', updateError);
          return;
        }
        
        console.log('✅ Updated challenge to ongoing with scores:', {
          id: updated.id,
          status: updated.status,
          scores: `${updated.challenger_score}-${updated.opponent_score}`,
          club_id: updated.club_id
        });
        
        // Check club owner
        const { data: club, error: clubError } = await supabase
          .from('club_profiles')
          .select('id, name, user_id')
          .eq('id', updated.club_id)
          .single();
          
        if (!clubError && club) {
          console.log('🏢 Club info:', {
            name: club.name,
            owner_user_id: club.user_id
          });
          console.log('👑 To see approval interface, login as user:', club.user_id);
        }
        
        console.log('🚀 Test setup complete!');
        console.log('📱 Go to challenges page and check the "live" tab');
        console.log('🔗 http://localhost:8081/challenges');
      }
      
      return;
    }
    
    // If we have accepted challenges, convert first one
    const testChallenge = acceptedChallenges[0];
    console.log('🎯 Converting challenge to ongoing:', testChallenge.id);
    
    const { data: updated, error: updateError } = await supabase
      .from('challenges')
      .update({
        status: 'ongoing',
        challenger_score: 9,
        opponent_score: 7,
        scheduled_time: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
      })
      .eq('id', testChallenge.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('❌ Error updating challenge:', updateError);
      return;
    }
    
    console.log('✅ Challenge updated successfully:', {
      id: updated.id,
      status: updated.status,
      scores: `${updated.challenger_score}-${updated.opponent_score}`,
      club_id: updated.club_id
    });
    
    console.log('🎉 Test challenge ready for approval system!');
    
  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

setupTestChallenge();
