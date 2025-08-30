import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Zap, 
  Trophy, 
  AlertTriangle, 
  CheckCircle, 
  Play,
  Pause,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'live' | 'urgent' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  startTime?: string;
  endTime?: string;
  showCountdown?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  size = 'md',
  animated = true,
  startTime,
  endTime,
  showCountdown = false,
  className
}) => {
  const [countdown, setCountdown] = React.useState<string>('');

  React.useEffect(() => {
    if (!showCountdown || !startTime) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(startTime).getTime();
      const diff = target - now;

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setCountdown(`${minutes}m ${seconds}s`);
        } else {
          setCountdown(`${seconds}s`);
        }
      } else {
        setCountdown('Bắt đầu!');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [startTime, showCountdown]);

  const getStatusConfig = (status: string, variant: string) => {
    const configs = {
      // Challenge statuses with dark mode optimization
      pending: {
        label: 'Chờ xử lý',
        icon: Clock,
        className: 'bg-warning-100 dark:bg-yellow-900/30 text-warning-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/50',
        pulse: false
      },
      accepted: {
        label: 'Đã chấp nhận',
        icon: CheckCircle,
        className: 'bg-primary-100 dark:bg-blue-900/30 text-primary-800 dark:text-blue-300 border-primary-200 dark:border-blue-700/50',
        pulse: false
      },
      ongoing: {
        label: 'Đang diễn ra',
        icon: Play,
        className: 'bg-error-100 dark:bg-red-900/30 text-error-800 dark:text-red-300 border-error-200 dark:border-red-700/50',
        pulse: true
      },
      live: {
        label: 'LIVE',
        icon: Zap,
        className: 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg shadow-red-500/25 dark:shadow-red-500/40',
        pulse: true
      },
      completed: {
        label: 'Hoàn thành',
        icon: Trophy,
        className: 'bg-success-100 dark:bg-green-900/30 text-success-800 dark:text-green-300 border-success-200 dark:border-green-700/50',
        pulse: false
      },
      cancelled: {
        label: 'Đã hủy',
        icon: Pause,
        className: 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-600 dark:text-gray-400 border-neutral-200 dark:border-gray-700/50',
        pulse: false
      },
      expired: {
        label: 'Hết hạn',
        icon: Timer,
        className: 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-600 dark:text-gray-400 border-neutral-200 dark:border-gray-700/50',
        pulse: false
      },
      // Special variants
      urgent: {
        label: 'Khẩn cấp',
        icon: AlertTriangle,
        className: 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg shadow-orange-500/25 dark:shadow-orange-500/40',
        pulse: true
      },
      starting_soon: {
        label: 'Sắp bắt đầu',
        icon: Clock,
        className: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/40',
        pulse: true
      }
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  const config = getStatusConfig(status, variant);
  const Icon = config.icon;

  const sizeConfig = {
    sm: 'text-caption px-2 py-0.5 gap-1',
    md: 'text-body-small px-3 py-1 gap-1.5',
    lg: 'text-body px-4 py-2 gap-2'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { type: 'spring' as const, duration: 0.3 }
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }
    },
    glow: {
      boxShadow: [
        '0 0 0 0 rgba(59, 130, 246, 0.5)',
        '0 0 0 8px rgba(59, 130, 246, 0)',
        '0 0 0 0 rgba(59, 130, 246, 0)'
      ],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  return (
    <motion.div
      variants={animated ? badgeVariants : undefined}
      initial="initial"
      animate={config.pulse ? ['animate', 'pulse'] : 'animate'}
      className={cn('inline-flex items-center', className)}
    >
      <Badge
        className={cn(
          'border font-medium transition-all duration-300 backdrop-blur-sm',
          sizeConfig[size],
          config.className,
          // Enhanced dark mode styling
          'dark:backdrop-blur-md'
        )}
      >
        <motion.div
          animate={config.pulse ? {
            rotate: [0, 360],
            transition: { duration: 2, repeat: Infinity, ease: 'linear' }
          } : undefined}
        >
          <Icon className={iconSize[size]} />
        </motion.div>
        <span>{config.label}</span>
        
        {showCountdown && countdown && (
          <motion.span
            key={countdown}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-1 font-mono"
          >
            {countdown}
          </motion.span>
        )}
      </Badge>

      {/* Glow effect for live status */}
      {status === 'live' && animated && (
        <motion.div
          className="absolute inset-0 rounded-full"
          variants={badgeVariants}
          animate="glow"
        />
      )}
    </motion.div>
  );
};

// Status Badge Group Component
interface StatusBadgeGroupProps {
  statuses: Array<{
    status: string;
    variant?: 'default' | 'live' | 'urgent' | 'success' | 'warning';
    label?: string;
  }>;
  size?: 'sm' | 'md' | 'lg';
  direction?: 'horizontal' | 'vertical';
  animated?: boolean;
  className?: string;
}

const StatusBadgeGroup: React.FC<StatusBadgeGroupProps> = ({
  statuses,
  size = 'md',
  direction = 'horizontal',
  animated = true,
  className
}) => {
  return (
    <div
      className={cn(
        'flex gap-2',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      <AnimatePresence>
        {statuses.map((item, index) => (
          <motion.div
            key={`${item.status}-${index}`}
            initial={{ opacity: 0, x: direction === 'horizontal' ? -20 : 0, y: direction === 'vertical' ? -20 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatusBadge
              status={item.status}
              variant={item.variant}
              size={size}
              animated={animated}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { StatusBadge, StatusBadgeGroup };
export default StatusBadge;
