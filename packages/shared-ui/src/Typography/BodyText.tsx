import React from 'react';
import { Typography } from './Typography';

interface BodyTextProps {
  size?: 'small' | 'base' | 'large';
  className?: string;
  children: React.ReactNode;
}

export const BodyText: React.FC<BodyTextProps> = ({ size = 'base', className, children }) => {
  const variant = size === 'small' ? 'body-small' : size === 'large' ? 'body-large' : 'body';
  
  return (
    <Typography variant={variant} className={className}>
      {children}
    </Typography>
  );
};
