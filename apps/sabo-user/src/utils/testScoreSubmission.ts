/**
 * Quick Score Submission Test
 * Creates test data and tests the score submission flow
 */

import { supabase } from '@/integrations/supabase/client';

export const createTestOngoingChallenge = async () => {
  try {
    console.log('🎯 Creating test ongoing challenge...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No authenticated user');
      return null;
    }

    // Get another user as opponent (for demo, we'll use a mock)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .limit(1);

    const opponent = profiles?.[0];
    if (!opponent) {
      console.error('❌ No opponent found');
      return null;
    }

    // Get a club
    const { data: clubs } = await supabase
      .from('clubs')
      .select('*')
      .limit(1);

    const club = clubs?.[0];
    if (!club) {
      console.error('❌ No club found');
      return null;
    }

    // Create test challenge
    const { data: challenge, error } = await supabase
      .from('challenges')
      .insert({
        challenger_id: user.id,
        opponent_id: opponent.id,
        club_id: club.id,
        bet_points: 100,
        race_to: 9,
        status: 'ongoing',
        message: 'Test challenge for score submission - ' + new Date().toISOString(),
        scheduled_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create challenge:', error);
      return null;
    }

    console.log('✅ Created test challenge:', challenge);
    return challenge;
    
  } catch (error) {
    console.error('❌ Error creating test challenge:', error);
    return null;
  }
};

export const testScoreSubmission = async (challengeId: string) => {
  try {
    console.log('🎯 Testing score submission for challenge:', challengeId);

    // Submit score
    const { error } = await supabase
      .from('challenges')
      .update({
        challenger_score: 9,
        opponent_score: 7,
        response_message: 'Test score: 9-7 (Great match!)'
      })
      .eq('id', challengeId);

    if (error) {
      console.error('❌ Failed to submit score:', error);
      return false;
    }

    console.log('✅ Score submitted successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error submitting score:', error);
    return false;
  }
};

// Global functions for browser console
if (typeof window !== 'undefined') {
  (window as any).createTestChallenge = createTestOngoingChallenge;
  (window as any).testScoreSubmission = testScoreSubmission;
  
  console.log('🎯 Score submission test functions loaded!');
  console.log('Use: createTestChallenge() to create test data');
  console.log('Use: testScoreSubmission(challengeId) to test score submission');
}

export default {
  createTestOngoingChallenge,
  testScoreSubmission
};
