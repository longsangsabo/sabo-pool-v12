import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'ghost' 
  | 'outline' 
  | 'destructive' 
  | 'success' 
  | 'warning'
  | 'tournament'
  | 'challenge'
  | 'sabo-special';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ButtonState = 'default' | 'loading' | 'disabled' | 'success' | 'error';

export interface ButtonProps {
  // Core functionality
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  
  // Content
  children?: ReactNode;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  loadingText?: string;
  
  // Behavior
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  
  // Styling
  className?: string;
  fullWidth?: boolean;
  
  // Advanced features
  tooltip?: string;
  badge?: string | number;
  pulse?: boolean;
  gradient?: boolean;
  
  // Accessibility
  'aria-label'?: string;
  'data-testid'?: string;
}

export interface ButtonVariantConfig {
  base: string;
  variants: Record<ButtonVariant, string>;
  sizes: Record<ButtonSize, string>;
  states: Record<ButtonState, string>;
}
