import { create } from 'zustand';

// Define local Tournament interface for now
export interface Tournament {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: 'registration_open' | 'in_progress' | 'completed' | 'upcoming';
  max_participants: number;
  current_participants: number;
  entry_fee?: number;
  prize_pool?: number;
  tournament_type: 'single_elimination' | 'double_elimination' | 'round_robin';
  club_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  registration_deadline?: string;
}

interface TournamentStore {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentTournament: (tournament: Tournament | null) => void;
  clearError: () => void;
  fetchTournaments: () => Promise<void>;
  fetchTournamentById: (id: string) => Promise<void>;
  joinTournament: (tournamentId: string) => Promise<void>;
  leaveTournament: (tournamentId: string) => Promise<void>;
  getTournamentById: (id: string) => Tournament | undefined;
}

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  tournaments: [],
  currentTournament: null,
  isLoading: false,
  error: null,

  setCurrentTournament: (tournament) => set({ currentTournament: tournament }),
  clearError: () => set({ error: null }),

  fetchTournaments: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual shared-business service once imports are resolved
      // const tournaments = await tournamentService.getAllTournaments();
      
      // Mock data for now with realistic tournament structure
      const mockTournaments: Tournament[] = [
        {
          id: '1',
          title: 'SABO Championship 2025',
          description: 'Giải đấu lớn nhất năm',
          start_date: '2025-01-15T10:00:00Z',
          end_date: '2025-01-15T18:00:00Z',
          status: 'registration_open',
          max_participants: 32,
          current_participants: 12,
          entry_fee: 100000,
          prize_pool: 3000000,
          tournament_type: 'single_elimination',
          created_by: 'admin',
          created_at: '2024-12-20T10:00:00Z',
          updated_at: '2024-12-20T10:00:00Z',
          registration_deadline: '2025-01-14T23:59:59Z',
        },
        {
          id: '2',
          title: 'Weekly Tournament',
          description: 'Giải đấu hàng tuần',
          start_date: '2025-01-01T14:00:00Z',
          status: 'in_progress',
          max_participants: 16,
          current_participants: 16,
          entry_fee: 50000,
          prize_pool: 800000,
          tournament_type: 'double_elimination',
          created_by: 'club_owner',
          created_at: '2024-12-25T10:00:00Z',
          updated_at: '2024-12-25T10:00:00Z',
          registration_deadline: '2024-12-31T23:59:59Z',
        },
        {
          id: '3',
          title: 'Beginner Tournament',
          description: 'Perfect for new players',
          start_date: '2025-01-20T16:00:00Z',
          status: 'registration_open',
          max_participants: 16,
          current_participants: 5,
          entry_fee: 25000,
          prize_pool: 400000,
          tournament_type: 'round_robin',
          created_by: 'system',
          created_at: '2024-12-22T10:00:00Z',
          updated_at: '2024-12-22T10:00:00Z',
          registration_deadline: '2025-01-19T23:59:59Z',
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ tournaments: mockTournaments, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tournaments';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchTournamentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual shared-business service
      // const tournament = await tournamentService.getTournamentById(id);
      
      const tournaments = get().tournaments;
      let tournament = tournaments.find(t => t.id === id);
      
      // If not found in local tournaments, fetch from mock data
      if (!tournament) {
        await get().fetchTournaments();
        tournament = get().tournaments.find(t => t.id === id);
      }
      
      set({ currentTournament: tournament || null, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tournament';
      set({ error: errorMessage, isLoading: false });
    }
  },

  joinTournament: async (tournamentId: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual shared-business service
      // await tournamentService.joinTournament(tournamentId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      const tournaments = get().tournaments.map(tournament => 
        tournament.id === tournamentId 
          ? { ...tournament, current_participants: tournament.current_participants + 1 }
          : tournament
      );
      set({ tournaments, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join tournament';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  leaveTournament: async (tournamentId: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual shared-business service
      // await tournamentService.leaveTournament(tournamentId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      const tournaments = get().tournaments.map(tournament => 
        tournament.id === tournamentId 
          ? { ...tournament, current_participants: Math.max(0, tournament.current_participants - 1) }
          : tournament
      );
      set({ tournaments, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave tournament';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getTournamentById: (id: string) => {
    return get().tournaments.find(tournament => tournament.id === id);
  },
}));
