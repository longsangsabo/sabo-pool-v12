// Player Experience Components
export { PlayerCard } from './PlayerCard';
export { AvatarManager } from './AvatarManager';
export { PlayerStatistics } from './PlayerStatistics';
export { AchievementSystem } from './AchievementSystem';

// Gaming Components
export { ScoreTracker } from '../gaming/ScoreTracker';
export { TournamentCountdown, MultiTournamentCountdown } from '../gaming/TournamentCountdown';
export { LiveMatchStatus, LiveMatchesGrid } from '../gaming/LiveMatchStatus';

// Performance Components  
export { 
  Skeleton, 
  TournamentCardSkeleton, 
  PlayerCardSkeleton, 
  DashboardSkeleton 
} from '../performance/Skeleton';
export { 
  createLazyComponent, 
  LazyTournamentBracket, 
  LazyContent 
} from '../performance/LazyLoad';
export { 
  PerformanceMonitor, 
  usePerformanceMonitoring 
} from '../performance/PerformanceMonitor';

// PWA Components
export { PWAInstallPrompt, usePWA } from '../pwa/PWAFeatures';

// Re-export types for external use
export interface PlayerStats {
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number;
  ranking: number;
  points: number;
  tournamentsWon: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  experience: number;
  nextLevelExperience: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface AvatarTheme {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  preview: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockCondition?: string;
}
