import React from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Check, 
  X, 
  Eye, 
  Play, 
  Trophy, 
  Share2, 
  Bell,
  Target,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChallengeAction } from '@/types/challengeCard';

interface SmartActionButtonProps {
  action: ChallengeAction;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  count?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  glowing?: boolean;
  onClick: (action: ChallengeAction) => void;
  className?: string;
}

const SmartActionButton: React.FC<SmartActionButtonProps> = ({
  action,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  count,
  priority = 'medium',
  glowing = false,
  onClick,
  className
}) => {
  const actionConfig = {
    join: {
      icon: Zap,
      label: 'Tham gia',
      loadingLabel: 'Đang tham gia...',
      variant: 'default' as const,
      className: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg shadow-green-500/25 dark:shadow-green-500/40'
    },
    accept: {
      icon: Check,
      label: 'Chấp nhận',
      loadingLabel: 'Đang chấp nhận...',
      variant: 'default' as const,
      className: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/40'
    },
    decline: {
      icon: X,
      label: 'Từ chối',
      loadingLabel: 'Đang từ chối...',
      variant: 'outline' as const,
      className: 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50'
    },
    cancel: {
      icon: X,
      label: 'Hủy',
      loadingLabel: 'Đang hủy...',
      variant: 'destructive' as const,
      className: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg shadow-red-500/25 dark:shadow-red-500/40'
    },
    view: {
      icon: Eye,
      label: 'Xem',
      loadingLabel: 'Đang tải...',
      variant: 'ghost' as const,
      className: 'text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground hover:bg-accent/50 dark:hover:bg-accent/30'
    },
    watch: {
      icon: Play,
      label: 'Xem Live',
      loadingLabel: 'Đang kết nối...',
      variant: 'outline' as const,
      className: 'border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 animate-pulse'
    },
    score: {
      icon: Trophy,
      label: 'Nhập tỷ số',
      loadingLabel: 'Đang ghi nhận...',
      variant: 'default' as const,
      className: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-yellow-500/25 dark:shadow-yellow-500/40'
    },
    share: {
      icon: Share2,
      label: 'Chia sẻ',
      loadingLabel: 'Đang chia sẻ...',
      variant: 'ghost' as const,
      className: 'text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground hover:bg-accent/50 dark:hover:bg-accent/30'
    },
    notify: {
      icon: Bell,
      label: 'Nhắc nhở',
      loadingLabel: 'Đang gửi...',
      variant: 'outline' as const,
      className: 'border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50'
    }
  };

  const config = actionConfig[action];
  const Icon = config.icon;

  const sizeConfig = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const priorityEffects = {
    low: '',
    medium: 'hover:scale-105',
    high: 'hover:scale-105 ring-2 ring-primary/20 dark:ring-primary/40',
    critical: 'hover:scale-110 ring-2 ring-red-500/50 dark:ring-red-400/60 animate-pulse'
  };

  const buttonVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
    },
    hover: { 
      scale: priority === 'critical' ? 1.1 : 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 },
    loading: {
      scale: [1, 1.02, 1],
      transition: { duration: 0.8, repeat: Infinity }
    },
    glow: glowing ? {
      boxShadow: [
        '0 0 0 0 rgba(59, 130, 246, 0.7)',
        '0 0 0 10px rgba(59, 130, 246, 0)',
        '0 0 0 0 rgba(59, 130, 246, 0)'
      ],
      transition: { duration: 2, repeat: Infinity }
    } : {}
  };

  return (
    <motion.div
      variants={buttonVariants}
      initial="initial"
      animate={['animate', loading ? 'loading' : '', glowing ? 'glow' : ''].filter(Boolean)}
      whileHover="hover"
      whileTap="tap"
      className="relative"
    >
      <Button
        variant={variant}
        size={size}
        disabled={disabled || loading}
        onClick={() => onClick(action)}
        className={cn(
          'relative overflow-hidden font-medium transition-all duration-300',
          sizeConfig[size],
          priorityEffects[priority],
          config.className,
          // Enhanced dark mode support
          'backdrop-blur-sm',
          // Disabled state in dark mode
          (disabled || loading) && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {/* Background glow effect */}
        {glowing && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 rounded-md"></div>
        )}

        {/* Content */}
        <div className="relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Loader2 className={cn(iconSize[size], 'animate-spin')} />
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className={iconSize[size]} />
              </motion.div>
            )}
          </AnimatePresence>

          <span className="ml-2">
            {loading ? config.loadingLabel : config.label}
          </span>

          {/* Count badge */}
          {count && count > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold',
                'bg-background/80 dark:bg-card/80 text-foreground',
                'border border-border/50 dark:border-border/30'
              )}
            >
              {count}
            </motion.div>
          )}
        </div>

        {/* Sparkle effect for critical actions */}
        {priority === 'critical' && (
          <motion.div
            className="absolute top-1 right-1"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </motion.div>
        )}
      </Button>
    </motion.div>
  );
};

// Action Button Group Component
interface ActionButtonGroupProps {
  actions: Array<{
    action: ChallengeAction;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    count?: number;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    glowing?: boolean;
  }>;
  size?: 'sm' | 'md' | 'lg';
  direction?: 'horizontal' | 'vertical';
  onAction: (action: ChallengeAction) => void;
  className?: string;
}

const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  actions,
  size = 'md',
  direction = 'horizontal',
  onAction,
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
        {actions.map((actionConfig, index) => (
          <motion.div
            key={actionConfig.action}
            initial={{ 
              opacity: 0, 
              x: direction === 'horizontal' ? -20 : 0, 
              y: direction === 'vertical' ? -20 : 0 
            }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: index * 0.1 }}
          >
            <SmartActionButton
              {...actionConfig}
              size={size}
              onClick={onAction}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { SmartActionButton, ActionButtonGroup };
export default SmartActionButton;
