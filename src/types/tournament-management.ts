/**
 * Tournament Management Type Definitions
 * Extracted from TournamentManagementHub.tsx for better maintainability
 * Phase 1 - Step 1.1 of refactoring process
 */

// Core Tournament Interface
export interface Tournament {
  id: string;
  name: string;
  description: string;
  tournament_type: string;
  status: string;
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  tournament_start: string;
  tournament_end: string;
  registration_start: string;
  registration_end: string;
  created_at: string;
  updated_at?: string;
  club_id?: string;
  tier_id?: string;
  bracket_generated?: boolean;
  management_status?: string;
}

// Player Interface
export interface Player {
  id: string;
  full_name: string;
  display_name?: string;
  avatar_url?: string;
  elo: number;
  rank?: string;
  verified_rank?: string;
  current_rank?: string;
  user_id?: string;
  profiles?: {
    full_name?: string;
    display_name?: string;
    avatar_url?: string;
    elo?: number;
  };
}

// Bracket Match Interface
export interface BracketMatch {
  round: number;
  match_number: number;
  player1: Player | null;
  player2: Player | null;
  winner?: Player | null;
  status?: 'scheduled' | 'ongoing' | 'completed' | 'pending';
  tournament_id?: string;
  id?: string;
}

// Tournament Status Types
export type TournamentStatus =
  | 'draft'
  | 'registration_open'
  | 'registration_closed'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export type TournamentType =
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss';

export type BracketType = 'single_elimination' | 'double_elimination';

// View State Types
export type TournamentManagementView =
  | 'list'
  | 'bracket-generator'
  | 'bracket-viewer'
  | 'bracket-manager';

// Filter Types
export type TournamentFilter = 'active' | 'upcoming' | 'completed' | 'all';

// Tournament Management Hub Ref Interface
export interface TournamentManagementHubRef {
  refreshTournaments: () => void;
}

// Tournament List Props
export interface TournamentListProps {
  tournaments: Tournament[];
  loading: boolean;
  activeFilter: TournamentFilter;
  onFilterChange: (filter: TournamentFilter) => void;
  onTournamentSelect: (tournament: Tournament) => void;
  onGenerateBracket: (tournament: Tournament) => void;
  onEditTournament: (tournament: Tournament) => void;
  onDeleteTournament: (tournamentId: string) => void;
}

// Bracket Generation Props
export interface BracketGenerationProps {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  availablePlayers: Player[];
  selectedPlayers: Player[];
  tournamentSize: number;
  bracketType: BracketType;
  generatedBracket: BracketMatch[];
  loading: boolean;
  onPlayerSelectionChange: (players: Player[]) => void;
  onTournamentSizeChange: (size: number) => void;
  onBracketTypeChange: (type: BracketType) => void;
  onGenerateRandomBracket: () => void;
  onGenerateSeededBracket: () => void;
  onSaveBracket: () => void;
  onBackToList: () => void;
}

// Tournament Viewer Props
export interface TournamentViewerProps {
  tournament: Tournament;
  matches: BracketMatch[];
  loading: boolean;
  onBackToList: () => void;
  onRefresh: () => void;
}

// Service Response Types
export interface TournamentServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BracketGenerationResult {
  success: boolean;
  matches?: BracketMatch[];
  error?: string;
  total_matches?: number;
  matches_created?: number;
}

// Hook Return Types
export interface UseTournamentManagementReturn {
  tournaments: Tournament[];
  loading: boolean;
  error: string | null;
  selectedTournament: Tournament | null;
  currentView: TournamentManagementView;
  activeFilter: TournamentFilter;
  setSelectedTournament: (tournament: Tournament | null) => void;
  setCurrentView: (view: TournamentManagementView) => void;
  setActiveFilter: (filter: TournamentFilter) => void;
  fetchTournaments: () => Promise<void>;
  refreshTournaments: () => void;
}

export interface UseBracketManagementReturn {
  availablePlayers: Player[];
  selectedPlayers: Player[];
  tournamentSize: number;
  bracketType: BracketType;
  generatedBracket: BracketMatch[];
  loading: boolean;
  setSelectedPlayers: (players: Player[]) => void;
  setTournamentSize: (size: number) => void;
  setBracketType: (type: BracketType) => void;
  generateRandomBracket: () => Promise<void>;
  generateSeededBracket: () => Promise<void>;
  saveBracketToTournament: (tournamentId: string) => Promise<boolean>;
  loadTournamentParticipants: (tournamentId: string) => Promise<void>;
  loadAvailablePlayers: () => Promise<void>;
}

// Utility Types
export interface TournamentStatusInfo {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  color: string;
}

export interface PlayerRegistration {
  user_id: string;
  tournament_id: string;
  registration_status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  profiles?: {
    full_name?: string;
    display_name?: string;
    avatar_url?: string;
    elo?: number;
  };
}

// Constants
export const TOURNAMENT_STATUSES: Record<
  TournamentStatus,
  TournamentStatusInfo
> = {
  draft: { label: 'Nháp', variant: 'outline', color: 'gray' },
  registration_open: {
    label: 'Đang mở đăng ký',
    variant: 'default',
    color: 'blue',
  },
  registration_closed: {
    label: 'Đã đóng đăng ký',
    variant: 'secondary',
    color: 'orange',
  },
  ongoing: { label: 'Đang diễn ra', variant: 'default', color: 'green' },
  completed: { label: 'Đã kết thúc', variant: 'secondary', color: 'gray' },
  cancelled: { label: 'Đã hủy', variant: 'destructive', color: 'red' },
};

export const TOURNAMENT_TYPES: Record<TournamentType, string> = {
  single_elimination: 'Loại trực tiếp',
  double_elimination: 'Loại kép',
  round_robin: 'Vòng tròn',
  swiss: 'Swiss',
};

export const BRACKET_SIZES = [4, 8, 16, 32] as const;
export type BracketSize = (typeof BRACKET_SIZES)[number];
