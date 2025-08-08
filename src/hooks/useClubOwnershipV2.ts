import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface ClubOwnershipData {
  isClubOwner: boolean;
  clubProfile: {
    id: string;
    club_name: string;
    verification_status: string;
    user_id: string;
  } | null;
  memberData: {
    role: string;
    status: string;
  } | null;
  loading: boolean;
  error: string | null;
}

export const useClubOwnershipV2 = (): ClubOwnershipData => {
  const { user } = useAuth();
  const [data, setData] = useState<ClubOwnershipData>({
    isClubOwner: false,
    clubProfile: null,
    memberData: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const checkClubOwnership = async () => {
      if (!user) {
        setData({
          isClubOwner: false,
          clubProfile: null,
          memberData: null,
          loading: false,
          error: null
        });
        return;
      }

      try {
        // Use the new database function
        const { data: ownershipData, error } = await supabase
          .rpc('get_user_club_profile', { p_user_id: user.id });

        if (error) {
          console.error('Error checking club ownership:', error);
          setData(prev => ({
            ...prev,
            loading: false,
            error: error.message
          }));
          return;
        }

        const clubData = ownershipData?.[0];
        
        setData({
          isClubOwner: clubData?.is_owner || false,
          clubProfile: clubData?.club_id ? {
            id: clubData.club_id,
            club_name: clubData.club_name,
            verification_status: clubData.verification_status,
            user_id: user.id
          } : null,
          memberData: clubData?.member_role ? {
            role: clubData.member_role,
            status: clubData.member_status
          } : null,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error in useClubOwnershipV2:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    checkClubOwnership();
  }, [user]);

  return data;
};