/**
 * Mobile-First Card Component - Phase 3 Implementation
 * Demonstrates theme integration, mobile optimization, and touch targets
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@sabo/shared-ui';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, MoreVertical } from 'lucide-react';

interface MobileOptimizedCardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  status?: 'active' | 'pending' | 'completed';
  actions?: {
    primary: { label: string; onClick: () => void };
    secondary?: { label: string; onClick: () => void };
  };
  stats?: { label: string; value: string | number }[];
  className?: string;
}

export const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  title,
  description,
  imageUrl,
  status = 'active',
  actions,
  stats,
  className
}) => {
  const statusConfig = {
    active: {
      color: 'bg-primary text-primary-foreground',
      label: 'Đang hoạt động'
    },
    pending: {
      color: 'bg-secondary text-secondary-foreground',
      label: 'Chờ xử lý'
    },
    completed: {
      color: 'bg-muted text-muted-foreground',
      label: 'Hoàn thành'
    }
  };

  return (
    <div className={cn(
      // Theme-aware background and borders
      'bg-card border border-border rounded-lg shadow-sm',
      // Mobile-first spacing and layout
      'p-4 space-y-4',
      // Touch-friendly hover states
      'transition-all duration-200 hover:shadow-md active:scale-[0.98]',
      className
    )}>
      {/* Header with image and status */}
      <div className="flex items-start gap-3">
        {imageUrl && (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-foreground truncate">
              {title}
            </h3>
            
            {/* Mobile-optimized action button */}
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 min-w-[44px] min-h-[44px]"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
          
          {/* Status badge */}
          <Badge 
            className={cn(
              'mt-2',
              statusConfig[status].color
            )}
          >
            {statusConfig[status].label}
          </Badge>
        </div>
      </div>

      {/* Stats grid - mobile optimized */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-muted/50 rounded-lg p-3 text-center"
            >
              <div className="text-lg font-semibold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons - mobile-first layout */}
      <div className="flex flex-col sm:flex-row gap-2">
        {actions?.primary && (
          <Button
            onClick={actions.primary.onClick}
            className="flex-1 min-h-[44px]"
          >
            {actions.primary.label}
          </Button>
        )}
        
        {actions?.secondary && (
          <Button
            variant="outline"
            onClick={actions.secondary.onClick}
            className="flex-1 min-h-[44px]"
          >
            {actions.secondary.label}
          </Button>
        )}
      </div>

      {/* Mobile-optimized interaction bar */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[44px] px-2"
          >
            <Heart className="w-4 h-4 mr-1" />
            <span className="text-sm">Thích</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[44px] px-2"
          >
            <Share2 className="w-4 h-4 mr-1" />
            <span className="text-sm">Chia sẻ</span>
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          2 phút trước
        </div>
      </div>
    </div>
  );
};

export default MobileOptimizedCard;
