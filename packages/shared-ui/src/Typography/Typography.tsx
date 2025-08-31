import React from 'react';
import { cn } from '../lib/utils';

interface TypographyProps {
  variant?: 'caption' | 'body-small' | 'body' | 'body-large' | 'title' | 'heading' | 'display';
  className?: string;
  children: React.ReactNode;
  component?: keyof JSX.IntrinsicElements;
}

const typographyVariants = {
  caption: 'text-xs leading-4',      // 12px/16px
  'body-small': 'text-sm leading-5',  // 14px/20px  
  body: 'text-base leading-6',        // 16px/24px
  'body-large': 'text-lg leading-7',  // 18px/28px
  title: 'text-xl leading-7',         // 20px/28px
  heading: 'text-2xl leading-8',      // 24px/32px
  display: 'text-3xl leading-9'       // 30px/36px
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  className = '',
  children,
  component: Component = 'p'
}) => {
  return (
    <Component 
      className={cn(typographyVariants[variant], className)}
    >
      {children}
    </Component>
  );
};
