import { userService } from "../services/userService";
import { profileService } from "../services/profileService";
import { tournamentService } from "../services/tournamentService";
import { clubService } from "../services/clubService";
import { rankingService } from "../services/rankingService";
import { statisticsService } from "../services/statisticsService";
import { dashboardService } from "../services/dashboardService";
// Debug utility for forcing tournament UI refresh
// This can be called from browser console if UI doesn't update

export const debugTournamentRefresh = () => {
  console.log('🔧 Debug: Force refreshing tournament UI...');

  // Method 1: Clear React Query cache
  if ((window as any).queryClient) {
    console.log('✅ Clearing React Query cache...');
    (window as any).queryClient.invalidateQueries();
    (window as any).queryClient.refetchQueries();
  }

  // Method 2: Clear Supabase channels and reconnect
  // if ((window as any).supabase) {
  //   console.log('✅ Refreshing Supabase real-time connections...');
  //   const supabase = (window as any).supabase;
  //   removeAllChannels();
  // }

  // Method 3: Force page reload
  setTimeout(() => {
    console.log('✅ Force reloading page...');
    window.location.reload();
  }, 1000);
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugTournamentRefresh = debugTournamentRefresh;
  console.log(
    '🔧 Debug utility loaded. Call debugTournamentRefresh() to force refresh.'
  );
}

export const logTournamentState = async () => {
  // TODO: Replace with service call when supabase is available
  console.log('🏆 Tournament State Debug:');
  console.log('- Service integration pending');
  console.log('- No active tournaments (mock data)');
  
  // Mock tournament data for development
  const mockTournaments = [
    { id: 'mock-1', name: 'Mock Tournament', status: 'active' }
  ];
  
  console.table(mockTournaments);
};

// Make log function available globally too
if (typeof window !== 'undefined') {
  (window as any).logTournamentState = logTournamentState;
  console.log(
    '🔧 Debug utility: Call logTournamentState() to see current tournament state.'
  );
}
