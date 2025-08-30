import React from 'react';
import { Typography } from './Typography';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({ level = 2, className, children }) => {
  const variant = level <= 2 ? 'heading' : level <= 4 ? 'title' : 'body-large';
  const component = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Typography variant={variant} component={component} className={className}>
      {children}
    </Typography>
  );
};
