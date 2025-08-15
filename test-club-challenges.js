/**
 * Test ClubChallengesTab data fetching
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://afnxvgitcqkpdwsfcgpe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbnhWZ2l0Y3FrUGR3c2ZjZ3BlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTAyMjM2MywiZXhwIjoyMDUwNTk4MzYzfQ.dUjx1mhgNRNgBQGLOLOLt4qRm1A4kvh_4oVCMWpvUVU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testClubChallenges() {
  console.log('🔍 Testing club challenges data fetching...');

  try {
    // Find a club with challenges
    const { data: clubs, error: clubsError } = await supabase
      .from('club_profiles')
      .select('id, name')
      .limit(5);

    if (clubsError) {
      console.error('❌ Error fetching clubs:', clubsError);
      return;
    }

    console.log('🏢 Found clubs:', clubs?.map(c => c.name));

    // Test with first club
    const testClubId = clubs?.[0]?.id;
    if (!testClubId) {
      console.log('❌ No clubs found');
      return;
    }

    console.log(`🎯 Testing with club: ${clubs[0].name} (${testClubId})`);

    // Fetch challenges with full profile data
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenger_profile:profiles!challenges_challenger_id_fkey(
          id,
          user_id,
          full_name,
          avatar_url,
          current_rank,
          elo_rating,
          spa_points
        ),
        opponent_profile:profiles!challenges_opponent_id_fkey(
          id,
          user_id,
          full_name,
          avatar_url,
          current_rank,
          elo_rating,
          spa_points
        ),
        club_profiles!challenges_club_id_fkey(
          id,
          name,
          logo_url
        )
      `)
      .eq('club_id', testClubId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching challenges:', error);
      return;
    }

    console.log(`📊 Found ${challenges?.length || 0} challenges`);

    // Filter for pending approvals
    const pendingApprovals = challenges?.filter(c => 
      c.status === 'accepted' && 
      c.challenger_score != null && 
      c.opponent_score != null
    ) || [];

    console.log(`⏳ Found ${pendingApprovals.length} pending approvals`);

    // Show sample data
    if (pendingApprovals.length > 0) {
      const sample = pendingApprovals[0];
      console.log('📋 Sample pending approval:');
      console.log('  - ID:', sample.id);
      console.log('  - Status:', sample.status);
      console.log('  - Scores:', `${sample.challenger_score} - ${sample.opponent_score}`);
      console.log('  - Challenger:', sample.challenger_profile?.full_name);
      console.log('  - Opponent:', sample.opponent_profile?.full_name);
      console.log('  - Created:', sample.created_at);
    }

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testClubChallenges();
