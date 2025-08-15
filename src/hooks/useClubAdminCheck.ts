/**
 * Hook to check if current user is club admin for a specific challenge
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UseClubAdminCheckProps {
  challengeClubId?: string | null;
}

export const useClubAdminCheck = ({ challengeClubId }: UseClubAdminCheckProps) => {
  const { user } = useAuth();
  const [isClubAdmin, setIsClubAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkClubAdmin = async () => {
      if (!user?.id || !challengeClubId) {
        setIsClubAdmin(false);
        return;
      }

      setLoading(true);
      
      try {
        // Check if user is club owner in club_profiles table
        const { data: clubProfile, error } = await supabase
          .from('club_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('id', challengeClubId)
          .single();

        if (error) {
          console.log('Club admin check - no club profile found:', error.message);
          setIsClubAdmin(false);
          return;
        }

        // If we found a club profile, this user is the club owner
        setIsClubAdmin(!!clubProfile);
        
        console.log('🏢 Club admin check result:', {
          userId: user.id,
          challengeClubId,
          isClubAdmin: !!clubProfile,
          clubProfile
        });

      } catch (error) {
        console.error('Error checking club admin status:', error);
        setIsClubAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkClubAdmin();
  }, [user?.id, challengeClubId]);

  return {
    isClubAdmin,
    loading
  };
};
