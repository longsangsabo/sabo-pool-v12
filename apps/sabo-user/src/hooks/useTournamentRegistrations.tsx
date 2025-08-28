import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Player {
  id?: string;
  user_id: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  current_rank?: string;
  verified_rank?: string;
  elo?: number;
  elo_rating?: number;
}

interface Registration {
  id: string;
  tournament_id: string;
  user_id: string;
  registration_status: string;
  created_at: string;
  priority_order?: number;
  profiles?: Player; // This matches the Supabase query structure
  player?: Player; // This is what we'll transform to
}

export const useTournamentRegistrations = (tournamentId: string) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRegistrations = async () => {
    if (!tournamentId) {
      setRegistrations([]);
      return;
    }

    try {
      setLoading(true);

      // Fetch tournament registrations first
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('tournament_registrations')
        .select(
          `
          id,
          tournament_id,
          user_id,
          registration_status,
          created_at,
          priority_order
        `
        )
        .eq('tournament_id', tournamentId)
        .order('priority_order', { ascending: true, nullsLast: true })
        .order('created_at', { ascending: true });

      if (registrationsError) {
        console.error('Error fetching tournament registrations:', registrationsError);
        setRegistrations([]);
        return;
      }

      // Get user profiles separately to avoid relationship issues
      const userIds = registrationsData?.map(r => r.user_id).filter(Boolean) || [];
      let profilesData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(
            `
            id,
            user_id,
            full_name,
            display_name,
            avatar_url,
            current_rank,
            verified_rank,
            elo
          `
          )
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      // Transform the data to match our interface
      const transformedData = (registrationsData || []).map(
        reg => {
          const profile = profilesData.find(p => p.user_id === reg.user_id);
          return {
            ...reg,
            profiles: profile,
            player: profile
              ? {
                  id: profile.id,
                  user_id: profile.user_id,
                  full_name: profile.full_name,
                  display_name: profile.display_name,
                  avatar_url: profile.avatar_url,
                  current_rank: profile.current_rank,
                  verified_rank: profile.verified_rank,
                  elo: profile.elo || 1000,
                }
              : undefined,
          } as Registration;
        }
      );

      setRegistrations(transformedData);
    } catch (error) {
      console.error('Error in fetchRegistrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [tournamentId]);

  return {
    registrations,
    loading,
    fetchRegistrations,
  };
};
