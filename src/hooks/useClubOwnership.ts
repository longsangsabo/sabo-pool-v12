import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useClubOwnership = () => {
  const { user } = useAuth();
  const [isClubOwner, setIsClubOwner] = useState(false);
  const [clubData, setClubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkClubOwnership = async () => {
      if (!user) {
        setIsClubOwner(false);
        setClubData(null);
        setLoading(false);
        return;
      }

      try {
        // @ts-ignore - Suppress deep instantiation error
        const { data, error } = await supabase
          .from('club_members')
          .select('role, status, club_id')
          .eq('user_id', user.id)
          .eq('role', 'owner')
          .eq('status', 'active')
          .single();

        if (error) {
          console.error('Error checking club ownership:', error);
          setIsClubOwner(false);
          setClubData(null);
        } else {
          setIsClubOwner(!!data);
          setClubData(data);
        }
      } catch (error) {
        console.error('Error in useClubOwnership:', error);
        setIsClubOwner(false);
        setClubData(null);
      } finally {
        setLoading(false);
      }
    };

    checkClubOwnership();
  }, [user]);

  return {
    isClubOwner,
    clubData,
    loading,
  };
};