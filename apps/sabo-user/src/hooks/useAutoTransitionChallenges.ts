/**
 * Hook to automatically transition challenge status from accepted to ongoing
 * when scheduled_time is reached
 */

import { useEffect } from 'react';
// Removed supabase import - migrated to services

export const useAutoTransitionChallenges = () => {
  useEffect(() => {
    const transitionChallenges = async () => {
      try {
        // Get all accepted challenges where scheduled_time has passed
//         const { data: challenges, error } = await supabase
          .from('challenges')
          .select('id, scheduled_time')
          .eq('status', 'accepted')
          .lt('scheduled_time', new Date().toISOString());

        if (error) {
          console.error('Error fetching accepted challenges:', error);
          return;
        }

        if (!challenges || challenges.length === 0) {
          return;
        }

        console.log(`🔄 Found ${challenges.length} challenges ready to transition to ongoing`);

        // Update all eligible challenges to ongoing status
        const challengeIds = challenges.map(c => c.id);
        
//         const { error: updateError } = await supabase
          .from('challenges')
          .update({ 
            status: 'ongoing',
            started_at: new Date().toISOString()
          })
          .in('id', challengeIds);

        if (updateError) {
          console.error('Error updating challenge status:', updateError);
          return;
        }

        console.log(`✅ Successfully transitioned ${challengeIds.length} challenges to ongoing:`, challengeIds);

      } catch (error) {
        console.error('Auto transition error:', error);
      }
    };

    // Run immediately
    transitionChallenges();

    // Set up interval to check every minute
    const interval = setInterval(transitionChallenges, 60000);

    return () => clearInterval(interval);
  }, []);
};
