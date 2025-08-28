import React, { useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { ButtonProps } from './ButtonTypes';
import { buttonVariants, gamingButtonEffects } from './ButtonVariants';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  state = 'default',
  children,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loadingText = 'Loading...',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  fullWidth = false,
  tooltip,
  badge,
  pulse = false,
  gradient = false,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ...props
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [internalState, setInternalState] = useState<'success' | 'error' | null>(null);

  const handleClick = async () => {
    if (disabled || loading || !onClick) return;

    setIsClicked(true);
    
    try {
      await onClick();
      setInternalState('success');
      setTimeout(() => {
        setInternalState(null);
        setIsClicked(false);
      }, 1500);
    } catch (error) {
      setInternalState('error');
      setTimeout(() => {
        setInternalState(null);
        setIsClicked(false);
      }, 2000);
    }
  };

  const currentState = internalState || (loading ? 'loading' : state);
  const isDisabled = disabled || loading;

  const buttonClasses = clsx(
    buttonVariants.base,
    buttonVariants.variants[variant],
    buttonVariants.sizes[size],
    buttonVariants.states[currentState],
    {
      'w-full': fullWidth,
      [gamingButtonEffects.pulse]: pulse,
      [gamingButtonEffects.glow]: gradient,
      [gamingButtonEffects.tournament]: variant === 'tournament',
      [gamingButtonEffects.challenge]: variant === 'challenge',
    },
    className
  );

  const renderIcon = () => {
    if (currentState === 'loading') {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (currentState === 'success') {
      return <Check className="w-4 h-4" />;
    }
    if (currentState === 'error') {
      return <X className="w-4 h-4" />;
    }
    if (LeftIcon) {
      return <LeftIcon className="w-4 h-4" />;
    }
    return null;
  };

  const renderContent = () => {
    if (currentState === 'loading') {
      return loadingText;
    }
    if (currentState === 'success') {
      return 'Success!';
    }
    if (currentState === 'error') {
      return 'Error!';
    }
    return children;
  };

  return (
    <div className="relative inline-block">
      <button
        type={type}
        onClick={handleClick}
        disabled={isDisabled}
        className={buttonClasses}
        aria-label={ariaLabel}
        data-testid={testId}
        title={tooltip}
        {...props}
      >
        {renderIcon()}
        <span className="relative z-10">{renderContent()}</span>
        {RightIcon && !loading && currentState === 'default' && (
          <RightIcon className="w-4 h-4" />
        )}
        
        {/* Badge */}
        {badge && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
            {badge}
          </span>
        )}
        
        {/* Gaming effect overlay */}
        {(variant === 'tournament' || variant === 'challenge' || variant === 'sabo-special') && (
          <div className="absolute inset-0 rounded-inherit opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        )}
      </button>
      
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default Button;
