import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { spaService } from '@/services/spaService';

// Simplified SPA hook after milestone purge
export const useSPA = () => {
  const { user } = useAuth();
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user?.id) {
        setCurrentPoints(0);
        setLoading(false);
        return;
      }
      setLoading(true);
      const points = await spaService.getCurrentSPAPoints(user.id);
      if (active) {
        setCurrentPoints(points);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user?.id]);

  return {
    currentPoints,
    loading,
    refresh: async () => {
      if (!user?.id) return;
      const points = await spaService.getCurrentSPAPoints(user.id);
      setCurrentPoints(points);
    },
    add: (points: number, reason?: string) => user?.id ? spaService.addSPAPoints(user.id, points, reason) : Promise.resolve(0),
    deduct: (points: number, reason?: string) => user?.id ? spaService.deductSPAPoints(user.id, points, reason) : Promise.resolve(0),
  };
};
