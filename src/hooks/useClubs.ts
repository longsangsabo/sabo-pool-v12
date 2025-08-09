import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
        const { data, error } = await supabase
          .from('clubs')
          .select('id, name, address, status')
          .eq('status', 'active')
          .limit(limit);
        if (error) throw error;
        if (!cancelled) {
          setClubs(
            (data as any[])?.map(c => ({
              id: c.id,
              name: c.name || c.club_name || 'CLB',
              address: c.address,
              status: c.status,
            }))
          );
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
