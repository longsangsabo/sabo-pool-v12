import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Zap, Check, X, Ban, Eye, Play, BarChart3, Share2, Bell,
  Clock, Users, Trophy, Target, MessageCircle 
} from 'lucide-react';
import { ChallengeAction, actionButtonConfigs } from '@/types/challengeCard';

interface EnhancedActionButtonProps {
  action: ChallengeAction;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  customLabel?: string;
  customIcon?: React.ReactNode;
  showIcon?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const iconMap = {
  Zap, Check, X, Ban, Eye, Play, BarChart3, Share2, Bell,
  Clock, Users, Trophy, Target, MessageCircle
};

const EnhancedActionButton: React.FC<EnhancedActionButtonProps> = ({
  action,
  isLoading = false,
  disabled = false,
  onClick,
  customLabel,
  customIcon,
  showIcon = true,
  fullWidth = false,
  className = ''
}) => {
  const config = actionButtonConfigs[action];
  const IconComponent = config.icon ? iconMap[config.icon as keyof typeof iconMap] : Zap;
  
  const displayLabel = isLoading && config.loadingLabel 
    ? config.loadingLabel 
    : customLabel || config.label;

  return (
    <Button
      variant={config.variant}
      size={config.size}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${config.urgent ? 'ring-2 ring-primary/20 animate-pulse' : ''}
        transition-all duration-200 hover:scale-105 active:scale-95
        ${className}
      `}
    >
      {showIcon && (
        customIcon || (
          <IconComponent className={`
            ${config.size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} 
            ${isLoading ? 'animate-spin' : ''}
            ${displayLabel ? 'mr-2' : ''}
          `} />
        )
      )}
      {displayLabel && <span>{displayLabel}</span>}
    </Button>
  );
};

// Action button group for multiple actions
interface ActionButtonGroupProps {
  actions: Array<{
    action: ChallengeAction;
    onClick?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    customLabel?: string;
    hidden?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  fullWidth?: boolean;
  className?: string;
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  actions,
  orientation = 'horizontal',
  spacing = 'normal',
  fullWidth = false,
  className = ''
}) => {
  const visibleActions = actions.filter(a => !a.hidden);
  
  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    loose: 'gap-4'
  };

  const containerClass = orientation === 'horizontal' 
    ? `flex ${spacingClasses[spacing]}` 
    : `flex flex-col ${spacingClasses[spacing]}`;

  return (
    <div className={`${containerClass} ${className}`}>
      {visibleActions.map(({ action, onClick, isLoading, disabled, customLabel }, index) => (
        <EnhancedActionButton
          key={`${action}-${index}`}
          action={action}
          onClick={onClick}
          isLoading={isLoading}
          disabled={disabled}
          customLabel={customLabel}
          fullWidth={fullWidth || orientation === 'vertical'}
          className={fullWidth && orientation === 'horizontal' ? 'flex-1' : ''}
        />
      ))}
    </div>
  );
};

// Quick action floating button
interface QuickActionButtonProps {
  action: ChallengeAction;
  onClick?: () => void;
  isLoading?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  action,
  onClick,
  isLoading = false,
  position = 'top-right',
  className = ''
}) => {
  const config = actionButtonConfigs[action];
  const IconComponent = config.icon ? iconMap[config.icon as keyof typeof iconMap] : Zap;

  const positionClasses = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2'
  };

  return (
    <Button
      variant={config.variant}
      size="icon"
      disabled={isLoading}
      onClick={onClick}
      className={`
        absolute ${positionClasses[position]}
        h-8 w-8 rounded-full shadow-lg
        hover:scale-110 active:scale-95 transition-all duration-200
        ${config.urgent ? 'ring-2 ring-primary/30 animate-pulse' : ''}
        ${className}
      `}
    >
      <IconComponent className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
    </Button>
  );
};

// Context menu for multiple actions
interface ActionContextMenuProps {
  challengeId: string;
  actions: ChallengeAction[];
  onAction?: (challengeId: string, action: ChallengeAction) => void;
  children: React.ReactNode;
}

export const ActionContextMenu: React.FC<ActionContextMenuProps> = ({
  challengeId,
  actions,
  onAction,
  children
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleAction = (action: ChallengeAction) => {
    onAction?.(challengeId, action);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div 
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="cursor-context-menu"
      >
        {children}
      </div>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 z-20 mt-1 min-w-[200px] bg-popover border rounded-md shadow-md p-1">
            {actions.map((action) => {
              const config = actionButtonConfigs[action];
              const IconComponent = config.icon ? iconMap[config.icon as keyof typeof iconMap] : Zap;
              
              return (
                <button
                  key={action}
                  onClick={() => handleAction(action)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-sm transition-colors"
                >
                  <IconComponent className="w-4 h-4" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// Smart action button that changes based on challenge state
interface SmartActionButtonProps {
  challenge: any; // Challenge object
  currentUserId?: string;
  onAction?: (challengeId: string, action: ChallengeAction) => void;
  className?: string;
}

export const SmartActionButton: React.FC<SmartActionButtonProps> = ({
  challenge,
  currentUserId,
  onAction,
  className = ''
}) => {
  const isMyChallenge = challenge.challenger_id === currentUserId;
  const isOpponent = challenge.opponent_id === currentUserId;
  const isParticipant = isMyChallenge || isOpponent;

  // Determine primary action based on challenge state and user role
  const getPrimaryAction = (): ChallengeAction | null => {
    switch (challenge.status) {
      case 'pending':
        if (!challenge.opponent_id) return 'join'; // Open challenge
        if (isOpponent) return 'accept'; // Received challenge
        if (isMyChallenge) return 'cancel'; // My pending challenge
        return null;
        
      case 'accepted':
      case 'ongoing':
        if (isParticipant) return 'score'; // Can enter score
        return 'watch'; // Can watch
        
      case 'completed':
        return 'view'; // View details
        
      default:
        return null;
    }
  };

  const primaryAction = getPrimaryAction();
  
  if (!primaryAction) return null;

  return (
    <EnhancedActionButton
      action={primaryAction}
      onClick={() => onAction?.(challenge.id, primaryAction)}
      className={className}
    />
  );
};

export default EnhancedActionButton;
