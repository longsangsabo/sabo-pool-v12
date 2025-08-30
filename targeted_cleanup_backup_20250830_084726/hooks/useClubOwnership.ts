import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useClubOwnership = () => {
  const { user } = useAuth();
  const [isClubOwner, setIsClubOwner] = useState(false);
  const [clubProfile, setClubProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkClubOwnership = async () => {
      if (!user) {
        setIsClubOwner(false);
        setClubProfile(null);
        setLoading(false);
        return;
      }

      try {
        // Check if user has club_owner role in profiles and has approved club_profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profileData?.role?.includes('club_owner')) {
          setIsClubOwner(false);
          setClubProfile(null);
          setLoading(false);
          return;
        }

        // Get club profile
        const { data: clubData, error: clubError } = await supabase
          .from('club_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('verification_status', 'approved')
          .single();

        if (clubError || !clubData) {
          setIsClubOwner(false);
          setClubProfile(null);
        } else {
          setIsClubOwner(true);
          setClubProfile(clubData);
        }
      } catch (error) {
        console.error('Error in useClubOwnership:', error);
        setIsClubOwner(false);
        setClubProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkClubOwnership();
  }, [user]);

  return {
    isClubOwner,
    clubProfile,
    loading,
  };
};
