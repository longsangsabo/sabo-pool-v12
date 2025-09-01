import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
 Clock, Check, Zap, Play, Trophy, X, XCircle, 
 AlertTriangle, Users, CheckCircle, Bell, Flame 
} from 'lucide-react';
import { StatusBadgeConfig, statusBadgeConfigs } from '@/types/challengeCard';

interface EnhancedStatusBadgeProps {
 status: string;
 customConfig?: StatusBadgeConfig;
 showIcon?: boolean;
 pulse?: boolean;
 size?: 'sm' | 'md' | 'lg';
 className?: string;
}

const iconMap = {
 Clock,
 Check,
 Zap,
 Play,
 Trophy,
 X,
 XCircle,
 AlertTriangle,
 Users,
 CheckCircle,
 Bell,
 Flame,
};

const EnhancedStatusBadge: React.FC<EnhancedStatusBadgeProps> = ({
 status,
 customConfig,
 showIcon = true,
 pulse: forcePulse,
 size = 'md',
 className = ''
}) => {
 const config = customConfig || statusBadgeConfigs[status] || {
  color: 'gray',
  label: status,
  icon: 'Clock'
 };

 const shouldPulse = forcePulse !== undefined ? forcePulse : config.pulse;
 const IconComponent = config.icon ? iconMap[config.icon as keyof typeof iconMap] : Clock;

 // Color mapping với enhanced styles
 const colorStyles = {
  red: 'bg-error-100 text-error-800 border-error-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  green: 'bg-success-100 text-success-800 border-success-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  blue: 'bg-primary-100 text-primary-800 border-primary-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  yellow: 'bg-warning-100 text-warning-800 border-warning dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  gray: 'bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-900/20 dark:text-gray-300 dark:border-gray-700',
  purple: 'bg-info-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
  orange: 'bg-warning-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
 };

 // Size configurations
 const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
 };

 const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
 };

 return (
  <Badge
   variant="outline"
   className={`
    ${colorStyles[config.color]}
    ${sizeStyles[size]}
    ${shouldPulse ? 'animate-pulse' : ''}
    ${config.urgent ? 'ring-2 ring-orange-300 ring-opacity-50' : ''}
    border font-medium inline-flex items-center gap-1.5
    transition-all duration-200 hover:scale-105
    ${className}
   `}
  >
   {showIcon && IconComponent && (
    <IconComponent className={`${iconSizes[size]} flex-shrink-0`} />
   )}
   <span className="font-semibold">{config.label}</span>
   {shouldPulse && (
    <div className={`${iconSizes[size]} bg-current rounded-full opacity-20 animate-ping`} />
   )}
  </Badge>
 );
};

// Time-based status badge with countdown
interface CountdownBadgeProps {
 expiresAt: string;
 onExpired?: () => void;
 showIcon?: boolean;
 size?: 'sm' | 'md' | 'lg';
}

export const CountdownBadge: React.FC<CountdownBadgeProps> = ({
 expiresAt,
 onExpired,
 showIcon = true,
 size = 'md'
}) => {
 const [timeLeft, setTimeLeft] = React.useState<string>('');
 const [isExpired, setIsExpired] = React.useState(false);

 React.useEffect(() => {
  const updateCountdown = () => {
   const now = new Date().getTime();
   const expiry = new Date(expiresAt).getTime();
   const diff = expiry - now;

   if (diff <= 0) {
    setIsExpired(true);
    setTimeLeft('Hết hạn');
    onExpired?.();
    return;
   }

   const hours = Math.floor(diff / (1000 * 60 * 60));
   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
   const seconds = Math.floor((diff % (1000 * 60)) / 1000);

   if (hours > 0) {
    setTimeLeft(`${hours}h ${minutes}m`);
   } else if (minutes > 0) {
    setTimeLeft(`${minutes}m ${seconds}s`);
   } else {
    setTimeLeft(`${seconds}s`);
   }
  };

  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);

  return () => clearInterval(interval);
 }, [expiresAt, onExpired]);

 const getUrgencyConfig = (): StatusBadgeConfig => {
  if (isExpired) {
   return { color: 'gray', label: timeLeft, icon: 'X' };
  }

  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;
  const hoursLeft = diff / (1000 * 60 * 60);

  if (hoursLeft <= 1) {
   return { color: 'red', label: timeLeft, pulse: true, urgent: true, icon: 'AlertTriangle' };
  } else if (hoursLeft <= 6) {
   return { color: 'orange', label: timeLeft, pulse: true, icon: 'Clock' };
  } else {
   return { color: 'blue', label: timeLeft, icon: 'Clock' };
  }
 };

 return (
  <EnhancedStatusBadge
   status="countdown"
   customConfig={getUrgencyConfig()}
   showIcon={showIcon}
   size={size}
  />
 );
};

// Multiple status badges container
interface StatusBadgeGroupProps {
 statuses: Array<{
  key: string;
  status: string;
  config?: StatusBadgeConfig;
 }>;
 maxVisible?: number;
 size?: 'sm' | 'md' | 'lg';
 className?: string;
}

export const StatusBadgeGroup: React.FC<StatusBadgeGroupProps> = ({
 statuses,
 maxVisible = 3,
 size = 'md',
 className = ''
}) => {
 const visibleStatuses = statuses.slice(0, maxVisible);
 const hiddenCount = statuses.length - maxVisible;

 // Size configurations for the group
 const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
 };

 return (
  <div className={`flex flex-wrap gap-1.5 ${className}`}>
   {visibleStatuses.map(({ key, status, config }) => (
    <EnhancedStatusBadge
     key={key}
     status={status}
     customConfig={config}
     size={size}
    />
   ))}
   {hiddenCount > 0 && (
    <Badge variant="outline" className={`${sizeStyles[size]} bg-muted`}>
     +{hiddenCount}
    </Badge>
   )}
  </div>
 );
};

// Live indicator for ongoing matches
export const LiveIndicator: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => (
 <EnhancedStatusBadge
  status="live"
  showIcon={true}
  pulse={true}
  size={size}
  customConfig={{
   color: 'red',
   label: 'LIVE',
   pulse: true,
   icon: 'Zap'
  }}
 />
);

// Score status indicator
interface ScoreStatusBadgeProps {
 status: 'score_entered' | 'score_confirmed' | 'club_confirmed';
 challengerScore?: number;
 opponentScore?: number;
 size?: 'sm' | 'md' | 'lg';
}

export const ScoreStatusBadge: React.FC<ScoreStatusBadgeProps> = ({
 status,
 challengerScore,
 opponentScore,
 size = 'md'
}) => {
 const getScoreConfig = (): StatusBadgeConfig => {
  const hasScores = challengerScore !== undefined && opponentScore !== undefined;
  const scoreText = hasScores ? `${challengerScore} - ${opponentScore}` : '';

  switch (status) {
   case 'score_entered':
    return {
     color: 'orange',
     label: hasScores ? `${scoreText} (chờ xác nhận)` : 'Chờ xác nhận tỷ số',
     icon: 'Clock'
    };
   case 'score_confirmed':
    return {
     color: 'yellow',
     label: hasScores ? `${scoreText} (chờ CLB)` : 'Chờ CLB xác nhận',
     icon: 'Users'
    };
   case 'club_confirmed':
    return {
     color: 'green',
     label: hasScores ? `${scoreText} (hoàn thành)` : 'CLB đã xác nhận',
     icon: 'CheckCircle'
    };
   default:
    return { color: 'gray', label: 'Không xác định', icon: 'Clock' };
  }
 };

 return (
  <EnhancedStatusBadge
   status={status}
   customConfig={getScoreConfig()}
   size={size}
  />
 );
};

export default EnhancedStatusBadge;
