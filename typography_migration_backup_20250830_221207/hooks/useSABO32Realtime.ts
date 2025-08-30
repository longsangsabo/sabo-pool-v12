// =============================================
// SABO-32 REAL-TIME SYNC HOOK
// Auto-refresh data with Supabase realtime subscriptions
// =============================================

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSABO32RealtimeProps {
  tournamentId: string;
  onUpdate: () => void;
  enabled?: boolean;
}

export const useSABO32Realtime = ({ 
  tournamentId, 
  onUpdate, 
  enabled = true 
}: UseSABO32RealtimeProps) => {
  const subscriptionRef = useRef<any>(null);
  const lastUpdateRef = useRef<number>(0);

  // Debounced update function to prevent rapid refreshes
  const debouncedUpdate = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current > 1000) { // Min 1 second between updates
      lastUpdateRef.current = now;
      onUpdate();
    }
  }, [onUpdate]);

  useEffect(() => {
    if (!enabled || !tournamentId) return;

    console.log('🔄 Setting up SABO-32 realtime subscription for tournament:', tournamentId);

    // Create realtime subscription
    subscriptionRef.current = supabase
      .channel(`sabo32_tournament_${tournamentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sabo32_matches',
        filter: `tournament_id=eq.${tournamentId}`
      }, (payload) => {
        console.log('🔄 SABO-32 realtime update:', payload);
        debouncedUpdate();
      })
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        console.log('🔄 Cleaning up SABO-32 realtime subscription');
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [tournamentId, enabled, debouncedUpdate]);

  // Manual cleanup function
  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  }, []);

  return { cleanup };
};
