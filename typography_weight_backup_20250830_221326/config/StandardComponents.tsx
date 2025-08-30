// Component Design System Standardization
// Unified component styling and behavior patterns with Light/Dark Mode Support

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { SABO_DESIGN_TOKENS } from './DesignSystemConfig';
import { useThemedStyles } from '../contexts/ThemeContext';

// Standardized Card Components with Theme Support
interface StandardCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'default' | 'compact' | 'feature' | 'tournament' | 'challenge';
  className?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
}

const StandardCard: React.FC<StandardCardProps> = ({
  title,
  description,
  children,
  variant = 'default',
  className,
  headerActions,
  footer,
  ...props
}) => {
  const { getThemedValue } = useThemedStyles();

  const variants = {
    default: getThemedValue(
      'bg-white border-neutral-200 text-neutral-900',
      'bg-neutral-800 border-gray-700 text-gray-100'
    ) + ' rounded-lg border shadow-sm',
    compact: getThemedValue(
      'bg-white border-neutral-200 text-neutral-900',
      'bg-neutral-800 border-gray-700 text-gray-100'
    ) + ' rounded-md border shadow-sm',
    feature: getThemedValue(
      'bg-white border-neutral-200 text-neutral-900 hover:shadow-lg',
      'bg-neutral-800 border-gray-700 text-gray-100 hover:shadow-2xl'
    ) + ' rounded-xl border shadow-md transition-shadow',
    tournament: getThemedValue(
      'bg-white border-neutral-200 text-neutral-900 hover:shadow-md',
      'bg-neutral-800 border-gray-700 text-gray-100 hover:shadow-xl'
    ) + ' rounded-lg border shadow-sm transition-all duration-200',
    challenge: getThemedValue(
      'bg-white border-neutral-200 text-neutral-900 border-l-blue-500 hover:shadow-md',
      'bg-neutral-800 border-gray-700 text-gray-100 border-l-blue-400 hover:shadow-xl'
    ) + ' rounded-lg border-l-4 shadow-sm transition-all'
  };

  const paddingClasses = {
    default: 'p-4 md:p-6',
    compact: 'p-3 md:p-4',
    feature: 'p-6 md:p-8',
    tournament: 'p-4 md:p-6',
    challenge: 'p-4 md:p-6'
  };

  return (
    <Card className={cn(variants[variant], className)}>
      {(title || description || headerActions) && (
        <CardHeader className={cn(
          paddingClasses[variant], 
          footer && getThemedValue('border-b border-neutral-200', 'border-b border-gray-700')
        )}>
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {title && (
                <CardTitle className={cn(
                  variant === 'compact' ? 'text-body md:text-lg' : 'text-body-large md:text-xl',
                  'font-semibold',
                  getThemedValue('text-neutral-900', 'text-gray-100')
                )}>
                  {title}
                </CardTitle>
              )}
              {description && (
                <p className={cn(
                  variant === 'compact' ? 'text-sm' : 'text-body-small md:text-base',
                  getThemedValue('text-neutral-600', 'text-gray-400'),
                  title && 'mt-1'
                )}>
                  {description}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="ml-4 flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className={cn(
        paddingClasses[variant],
        (title || description || headerActions) && 'pt-0'
      )}>
        {children}
      </CardContent>
      
      {footer && (
        <div className={cn(
          paddingClasses[variant],
          getThemedValue(
            'border-t border-neutral-200 bg-neutral-50',
            'border-t border-gray-700 bg-neutral-900'
          )
        )}>
          {footer}
        </div>
      )}
    </Card>
  );
};

// Standardized Status Badge Component with Theme Support
interface StandardStatusBadgeProps {
  status: string;
  variant?: 'tournament' | 'challenge' | 'user' | 'general';
  className?: string;
}

const StandardStatusBadge: React.FC<StandardStatusBadgeProps> = ({
  status,
  variant = 'general',
  className
}) => {
  const { getThemedValue } = useThemedStyles();

  const getStatusConfig = (): { color: string; text: string } => {
    const configs = {
      tournament: {
        upcoming: { 
          color: getThemedValue('bg-primary-100 text-primary-800', 'bg-blue-900 text-blue-200'), 
          text: 'Sắp diễn ra' 
        },
        registration_open: { 
          color: getThemedValue('bg-success-100 text-success-800', 'bg-green-900 text-green-200'), 
          text: 'Đăng ký' 
        },
        ongoing: { 
          color: getThemedValue('bg-warning-100 text-warning-800', 'bg-yellow-900 text-yellow-200'), 
          text: 'Đang diễn ra' 
        },
        completed: { 
          color: getThemedValue('bg-neutral-100 text-neutral-800', 'bg-gray-700 text-gray-200'), 
          text: 'Hoàn thành' 
        },
        cancelled: { 
          color: getThemedValue('bg-error-100 text-error-800', 'bg-red-900 text-red-200'), 
          text: 'Đã hủy' 
        },
        locked: { 
          color: getThemedValue('bg-info-100 text-purple-800', 'bg-purple-900 text-purple-200'), 
          text: 'Đã khóa' 
        }
      },
      challenge: {
        open: { 
          color: getThemedValue('bg-success-100 text-success-800', 'bg-green-900 text-green-200'), 
          text: 'Mở' 
        },
        pending: { 
          color: getThemedValue('bg-warning-100 text-warning-800', 'bg-yellow-900 text-yellow-200'), 
          text: 'Chờ phản hồi' 
        },
        accepted: { 
          color: getThemedValue('bg-primary-100 text-primary-800', 'bg-blue-900 text-blue-200'), 
          text: 'Đã chấp nhận' 
        },
        in_progress: { 
          color: getThemedValue('bg-warning-100 text-orange-800', 'bg-orange-900 text-orange-200'), 
          text: 'Đang chơi' 
        },
        completed: { 
          color: getThemedValue('bg-neutral-100 text-neutral-800', 'bg-gray-700 text-gray-200'), 
          text: 'Hoàn thành' 
        },
        declined: { 
          color: getThemedValue('bg-error-100 text-error-800', 'bg-red-900 text-red-200'), 
          text: 'Từ chối' 
        },
        expired: { 
          color: getThemedValue('bg-neutral-100 text-neutral-600', 'bg-gray-700 text-gray-400'), 
          text: 'Hết hạn' 
        }
      },
      user: {
        online: { 
          color: getThemedValue('bg-success-100 text-success-800', 'bg-green-900 text-green-200'), 
          text: 'Trực tuyến' 
        },
        offline: { 
          color: getThemedValue('bg-neutral-100 text-neutral-600', 'bg-gray-700 text-gray-400'), 
          text: 'Ngoại tuyến' 
        },
        away: { 
          color: getThemedValue('bg-warning-100 text-warning-800', 'bg-yellow-900 text-yellow-200'), 
          text: 'Vắng mặt' 
        },
        busy: { 
          color: getThemedValue('bg-error-100 text-error-800', 'bg-red-900 text-red-200'), 
          text: 'Bận' 
        }
      },
      general: {
        active: { 
          color: getThemedValue('bg-success-100 text-success-800', 'bg-green-900 text-green-200'), 
          text: 'Hoạt động' 
        },
        inactive: { 
          color: getThemedValue('bg-neutral-100 text-neutral-600', 'bg-gray-700 text-gray-400'), 
          text: 'Không hoạt động' 
        },
        pending: { 
          color: getThemedValue('bg-warning-100 text-warning-800', 'bg-yellow-900 text-yellow-200'), 
          text: 'Chờ xử lý' 
        },
        success: { 
          color: getThemedValue('bg-success-100 text-success-800', 'bg-green-900 text-green-200'), 
          text: 'Thành công' 
        },
        error: { 
          color: getThemedValue('bg-error-100 text-error-800', 'bg-red-900 text-red-200'), 
          text: 'Lỗi' 
        },
        warning: { 
          color: getThemedValue('bg-warning-100 text-warning-800', 'bg-yellow-900 text-yellow-200'), 
          text: 'Cảnh báo' 
        }
      }
    } as const;

    const configEntry = (configs as any)[variant]?.[status];
    return configEntry || { 
      color: getThemedValue('bg-neutral-100 text-neutral-600', 'bg-gray-700 text-gray-400'), 
      text: status 
    };
  };

  const config = getStatusConfig();
  
  return (
    <Badge className={cn(config.color, 'text-caption font-medium', className)}>
      {config.text}
    </Badge>
  );
};

// Standardized User Profile Component
interface StandardUserProfileProps {
  user: {
    id: string;
    username?: string;
    display_name?: string;
    full_name?: string;
    avatar_url?: string;
    current_rank?: string;
    spa_points?: number;
    verified_rank?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showRank?: boolean;
  showPoints?: boolean;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const StandardUserProfile: React.FC<StandardUserProfileProps> = ({
  user,
  size = 'md',
  showRank = false,
  showPoints = false,
  showStatus = false,
  status,
  orientation = 'horizontal',
  className
}) => {
  const sizes = {
    sm: { avatar: 'w-8 h-8', text: 'text-sm', subtext: 'text-xs' },
    md: { avatar: 'w-10 h-10', text: 'text-base', subtext: 'text-sm' },
    lg: { avatar: 'w-12 h-12', text: 'text-lg', subtext: 'text-base' }
  };

  const sizeConfig = sizes[size];
  const displayName = user.display_name || user.full_name || user.username || `User ${user.id.slice(0, 8)}`;
  const config = sizes[size];

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col items-center text-center space-y-2', className)}>
        <div className="relative">
          <Avatar className={sizeConfig.avatar}>
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="bg-primary-100 text-primary-600">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {showStatus && (
            <div className={cn(
              'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white',
              status === 'online' ? 'bg-success-500' :
              status === 'away' ? 'bg-warning-500' :
              status === 'busy' ? 'bg-error-500' : 'bg-gray-400'
            )} />
          )}
        </div>
        <div className="space-y-1">
          <div className={cn(sizeConfig.text, 'font-medium text-neutral-900 truncate')}>
            {displayName}
          </div>
          <div className="flex flex-col items-center space-y-1">
            {showRank && user.verified_rank && (
              <StandardStatusBadge 
                status={user.verified_rank} 
                variant="general"
                className="text-caption"
              />
            )}
            {showPoints && user.spa_points !== undefined && (
              <div className={cn(sizeConfig.subtext, 'text-neutral-600')}>
                {user.spa_points} SPA
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <div className="relative flex-shrink-0">
        <Avatar className={sizeConfig.avatar}>
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="bg-primary-100 text-primary-600">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {showStatus && (
          <div className={cn(
            'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white',
            status === 'online' ? 'bg-success-500' :
            status === 'away' ? 'bg-warning-500' :
            status === 'busy' ? 'bg-error-500' : 'bg-gray-400'
          )} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn(sizeConfig.text, 'font-medium text-neutral-900 truncate')}>
          {displayName}
        </div>
        <div className="flex items-center space-x-2">
          {showRank && user.verified_rank && (
            <StandardStatusBadge 
              status={user.verified_rank} 
              variant="general"
              className="text-caption"
            />
          )}
          {showPoints && user.spa_points !== undefined && (
            <div className={cn(sizeConfig.subtext, 'text-neutral-600')}>
              {user.spa_points} SPA
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Standardized Stats Grid Component
interface StandardStatsGridProps {
  stats: Array<{
    id: string;
    label: string;
    value: string | number;
    icon?: React.ComponentType<any>;
    trend?: {
      value: number;
      direction: 'up' | 'down' | 'neutral';
    };
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  }>;
  variant?: 'compact' | 'default' | 'featured';
  className?: string;
}

const StandardStatsGrid: React.FC<StandardStatsGridProps> = ({
  stats,
  variant = 'default',
  className
}) => {
  const gridClasses = {
    compact: 'grid grid-cols-2 md:grid-cols-4 gap-3',
    default: 'grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6',
    featured: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
  };

  const getColorClasses = (color: string = 'blue') => {
    const colors = {
      blue: { bg: 'bg-primary-50', text: 'text-primary-600', icon: 'text-blue-500' },
      green: { bg: 'bg-success-50', text: 'text-success-600', icon: 'text-green-500' },
      yellow: { bg: 'bg-warning-50', text: 'text-warning-600', icon: 'text-yellow-500' },
      red: { bg: 'bg-error-50', text: 'text-error-600', icon: 'text-red-500' },
      gray: { bg: 'bg-neutral-50', text: 'text-neutral-600', icon: 'text-neutral-500' }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={cn(gridClasses[variant], className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colors = getColorClasses(stat.color);
        
        return (
          <StandardCard
            key={stat.id}
            variant={variant === 'featured' ? 'feature' : 'compact'}
            className="text-center"
          >
            <div className="space-y-2">
              {Icon && (
                <div className={cn('mx-auto w-8 h-8 rounded-lg flex items-center justify-center', colors.bg)}>
                  <Icon className={cn('w-4 h-4', colors.icon)} />
                </div>
              )}
              <div className={cn(
                variant === 'compact' ? 'text-xl' : 'text-2xl',
                'font-bold',
                colors.text
              )}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className={cn(
                variant === 'compact' ? 'text-xs' : 'text-sm',
                'text-neutral-600 font-medium'
              )}>
                {stat.label}
              </div>
              {stat.trend && (
                <div className={cn(
                  'text-caption flex items-center justify-center space-x-1',
                  stat.trend.direction === 'up' ? 'text-success-600' :
                  stat.trend.direction === 'down' ? 'text-error-600' : 'text-neutral-600'
                )}>
                  <span>
                    {stat.trend.direction === 'up' ? '↗' : 
                     stat.trend.direction === 'down' ? '↘' : '→'}
                  </span>
                  <span>{Math.abs(stat.trend.value)}%</span>
                </div>
              )}
            </div>
          </StandardCard>
        );
      })}
    </div>
  );
};

// Standardized Loading Skeleton Component
interface StandardSkeletonProps {
  variant: 'card' | 'list' | 'profile' | 'stats' | 'custom';
  count?: number;
  className?: string;
}

const StandardSkeleton: React.FC<StandardSkeletonProps> = ({
  variant,
  count = 1,
  className
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <Card className={className}>
            <CardHeader>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-8 w-1/3" />
              </div>
            </CardContent>
          </Card>
        );
      
      case 'list':
        return (
          <div className={cn('space-y-3', className)}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'profile':
        return (
          <div className={cn('flex items-center space-x-3', className)}>
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        );
      
      case 'stats':
        return (
          <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <Skeleton className="h-8 w-8 mx-auto mb-2 rounded" />
                  <Skeleton className="h-6 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        );
      
      default:
        return <Skeleton className={className} />;
    }
  };

  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={count > 1 ? 'mb-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

// Export all components
export {
  StandardCard,
  StandardStatusBadge,
  StandardUserProfile,
  StandardStatsGrid,
  StandardSkeleton
};

export type StandardCardVariant = 'default' | 'compact' | 'feature' | 'tournament' | 'challenge';
export type StandardStatusVariant = 'tournament' | 'challenge' | 'user' | 'general';
export type StandardSkeletonVariant = 'card' | 'list' | 'profile' | 'stats' | 'custom';
