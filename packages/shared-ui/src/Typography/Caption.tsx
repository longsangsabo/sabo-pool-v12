import React from 'react';
import { Typography } from './Typography';

interface CaptionProps {
  className?: string;
  children: React.ReactNode;
}

export const Caption: React.FC<CaptionProps> = ({ className, children }) => (
  <Typography variant="caption" component="span" className={className}>
    {children}
  </Typography>
);
