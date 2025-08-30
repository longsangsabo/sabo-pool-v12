// Unified Challenge Card Types for Phase 2
import { Challenge } from './challenge';

// Standard action types for all card variants
export type ChallengeAction = 
  | 'join' 
  | 'accept' 
  | 'decline' 
  | 'cancel' 
  | 'view' 
  | 'watch'
  | 'score'
  | 'share'
  | 'notify';

// Unified card variant types
export type ChallengeCardVariant = 
  | 'open'      // Open challenges waiting for opponents
  | 'live'      // Live matches in progress
  | 'upcoming'  // Scheduled matches
  | 'completed' // Finished matches
  | 'pending'   // Awaiting response
  | 'compact';  // Compact view

// Standard props interface for all card components
export interface StandardChallengeCardProps {
  challenge: Challenge;
  variant: ChallengeCardVariant;
  currentUserId?: string;
  
  // Action handlers
  onAction?: (challengeId: string, action: ChallengeAction) => void;
  onJoin?: (challengeId: string) => Promise<void>;
  onSubmitScore?: (challengeId: string, challengerScore: number, opponentScore: number) => Promise<void>;
  
  // State management
  isLoading?: boolean;
  isJoining?: boolean;
  isSubmittingScore?: boolean;
  
  // Layout options
  compact?: boolean;
  showActions?: boolean;
  showDetails?: boolean;
  showAvatar?: boolean;
  
  // Highlighting
  highlighted?: boolean;
  urgent?: boolean;
  
  // Animation
  animationDelay?: number;
  disableAnimation?: boolean;
}

// Status badge configuration
export interface StatusBadgeConfig {
  color: 'red' | 'green' | 'blue' | 'yellow' | 'gray' | 'purple' | 'orange';
  label: string;
  pulse?: boolean;
  icon?: string;
  urgent?: boolean;
}

export const statusBadgeConfigs: Record<string, StatusBadgeConfig> = {
  // Challenge statuses
  pending: { color: 'yellow', label: 'Chờ xử lý', icon: 'Clock' },
  accepted: { color: 'blue', label: 'Đã chấp nhận', icon: 'Check' },
  live: { color: 'red', label: 'Đang live', pulse: true, icon: 'Zap' },
  ongoing: { color: 'red', label: 'Đang diễn ra', pulse: true, icon: 'Play' },
  completed: { color: 'green', label: 'Hoàn thành', icon: 'Trophy' },
  cancelled: { color: 'gray', label: 'Đã hủy', icon: 'X' },
  expired: { color: 'gray', label: 'Hết hạn', icon: 'Clock' },
  declined: { color: 'gray', label: 'Từ chối', icon: 'XCircle' },
  
  // Score workflow statuses
  score_entered: { color: 'orange', label: 'Chờ xác nhận tỷ số', icon: 'Clock' },
  score_confirmed: { color: 'yellow', label: 'Chờ CLB xác nhận', icon: 'Users' },
  club_confirmed: { color: 'green', label: 'CLB đã xác nhận', icon: 'CheckCircle' },
  
  // Time-based statuses
  expiring_soon: { color: 'orange', label: 'Sắp hết hạn', urgent: true, pulse: true, icon: 'AlertTriangle' },
  starting_soon: { color: 'blue', label: 'Sắp bắt đầu', pulse: true, icon: 'Clock' },
};

// Action button configuration
export interface ActionButtonConfig {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size: 'default' | 'sm' | 'lg' | 'icon';
  icon?: string;
  label: string;
  loadingLabel?: string;
  disabled?: boolean;
  urgent?: boolean;
}

export const actionButtonConfigs: Record<ChallengeAction, ActionButtonConfig> = {
  join: { 
    variant: 'default', 
    size: 'default', 
    icon: 'Zap', 
    label: 'Tham gia',
    loadingLabel: 'Đang tham gia...',
    urgent: true
  },
  accept: { 
    variant: 'default', 
    size: 'sm', 
    icon: 'Check', 
    label: 'Chấp nhận',
    loadingLabel: 'Đang chấp nhận...'
  },
  decline: { 
    variant: 'outline', 
    size: 'sm', 
    icon: 'X', 
    label: 'Từ chối' 
  },
  cancel: { 
    variant: 'destructive', 
    size: 'sm', 
    icon: 'Ban', 
    label: 'Hủy' 
  },
  view: { 
    variant: 'ghost', 
    size: 'sm', 
    icon: 'Eye', 
    label: 'Xem chi tiết' 
  },
  watch: { 
    variant: 'outline', 
    size: 'sm', 
    icon: 'Play', 
    label: 'Xem trực tiếp' 
  },
  score: { 
    variant: 'default', 
    size: 'sm', 
    icon: 'BarChart3', 
    label: 'Nhập tỷ số',
    loadingLabel: 'Đang ghi nhận...'
  },
  share: { 
    variant: 'ghost', 
    size: 'sm', 
    icon: 'Share2', 
    label: 'Chia sẻ' 
  },
  notify: { 
    variant: 'outline', 
    size: 'sm', 
    icon: 'Bell', 
    label: 'Nhắc nhở' 
  }
};

// Avatar size configuration
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export const avatarSizeConfig: Record<AvatarSize, { width: string; height: string; className: string }> = {
  sm: { width: 'w-8', height: 'h-8', className: 'w-8 h-8' },
  md: { width: 'w-10', height: 'h-10', className: 'w-10 h-10' },
  lg: { width: 'w-12', height: 'h-12', className: 'w-12 h-12' },
  xl: { width: 'w-16', height: 'h-16', className: 'w-16 h-16' }
};

// Design system color palette
export const challengeColors = {
  status: {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-blue-100 text-blue-800 border-blue-200',
    live: 'bg-red-100 text-red-800 border-red-200',
    ongoing: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    expired: 'bg-gray-100 text-gray-600 border-gray-200',
    declined: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  cards: {
    default: 'bg-card border-border hover:border-border/80',
    highlighted: 'bg-primary/5 border-primary/20 shadow-lg ring-2 ring-primary/10',
    urgent: 'bg-orange-50 border-orange-200 shadow-md',
    live: 'bg-red-50 border-red-200 shadow-md',
    completed: 'bg-green-50 border-green-200',
  },
  buttons: {
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    destructive: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  }
};

// Responsive breakpoints for cards
export const cardBreakpoints = {
  mobile: 'max-w-full',
  tablet: 'max-w-md',
  desktop: 'max-w-lg',
  wide: 'max-w-xl'
};

// Animation configurations
export const cardAnimations = {
  entrance: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 }
  },
  exit: {
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.15 }
  },
  hover: {
    whileHover: { scale: 1.02 },
    transition: { duration: 0.1 }
  },
  tap: {
    whileTap: { scale: 0.98 }
  },
  stagger: {
    staggerChildren: 0.05
  }
};
