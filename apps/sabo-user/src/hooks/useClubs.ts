import { useEffect, useState } from 'react';
// Removed supabase import - migrated to services

export interface ClubLite {
  id: string;
  name: string;
  address?: string;
  status?: string;
}

export const useClubs = (limit = 50) => {
  const [clubs, setClubs] = useState<ClubLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with service call - const { data, error } = await supabase
          .from('club_profiles')
          .select('id, club_name, address, verification_status')
          .eq('verification_status', 'approved')
          .limit(limit);
        
        if (error) {
          console.log('No approved clubs, trying all club profiles...');
//           const { data: allClubs, error: allError } = await supabase
            .from('club_profiles')
            .select('id, club_name, address, verification_status')
            .limit(limit);
          
          if (allError) throw allError;
          
          if (!cancelled) {
            setClubs(
              (allClubs as any[])?.map(c => ({
                id: c.id,
                name: c.club_name,
                address: c.address,
                status: c.verification_status,
              })) || []
            );
          }
        } else {
          if (!cancelled) {
            setClubs(
              (data as any[])?.map(c => ({
                id: c.id,
                name: c.club_name,
                address: c.address,
                status: c.verification_status,
              })) || []
            );
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Load clubs failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { clubs, loading, error };
};
