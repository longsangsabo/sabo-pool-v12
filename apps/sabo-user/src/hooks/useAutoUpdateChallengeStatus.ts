/**
 * Hook to automatically update challenge status based on scheduled time
 */

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAutoUpdateChallengeStatus = () => {
  useEffect(() => {
    const updateChallengeStatus = async () => {
      try {
        const now = new Date();
        
        // Find accepted challenges that should be ongoing (past scheduled time)
        const { data: challenges, error } = await supabase
          .from('challenges')
          .select('id, scheduled_time, status')
          .eq('status', 'accepted')
          .lt('scheduled_time', now.toISOString());

        if (error) {
          console.error('Error fetching accepted challenges:', error);
          return;
        }

        if (challenges && challenges.length > 0) {
          console.log(`🔄 Found ${challenges.length} challenges to update to ongoing status`);
          
          // Update challenges to ongoing status
          const challengeIds = challenges.map(c => c.id);
          
          const { error: updateError } = await supabase
            .from('challenges')
            .update({ status: 'ongoing' })
            .in('id', challengeIds);

          if (updateError) {
            console.error('Error updating challenge status:', updateError);
          } else {
            console.log(`✅ Updated ${challenges.length} challenges to ongoing status:`, challengeIds);
          }
        }
      } catch (error) {
        console.error('Auto update challenge status error:', error);
      }
    };

    // Run immediately
    updateChallengeStatus();

    // Then run every 30 seconds
    const interval = setInterval(updateChallengeStatus, 30000);

    return () => clearInterval(interval);
  }, []);
};

/**
 * Manual function to update a specific challenge status
 */
export const updateChallengeToOngoing = async (challengeId: string) => {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .update({ status: 'ongoing' })
      .eq('id', challengeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating challenge to ongoing:', error);
      return { success: false, error };
    }

    console.log(`✅ Updated challenge ${challengeId} to ongoing status`);
    return { success: true, data };
  } catch (error) {
    console.error('Update challenge status error:', error);
    return { success: false, error };
  }
};
