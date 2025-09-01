import React from 'react';

// Simple cn utility for className merging
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Typography Scale Components
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'display' | 'headline' | 'title' | 'body';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  variant = 'headline',
  weight = 'semibold',
  as,
  className,
  children,
  ...props
}) => {
  const Component = as || (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
  
  const variants = {
    display: 'text-4xl md:text-5xl lg:text-6xl',
    headline: 'text-2xl md:text-3xl lg:text-4xl',
    title: 'text-xl md:text-2xl',
    body: 'text-base md:text-lg',
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return React.createElement(
    Component,
    {
      className: cn(
        'text-text-primary',
        variants[variant],
        weights[weight],
        className
      ),
      ...props,
    },
    children
  );
};

// Text Component
export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error';
  as?: 'p' | 'span' | 'div' | 'label';
}

export const Text: React.FC<TextProps> = ({
  size = 'base',
  weight = 'normal',
  color = 'primary',
  as = 'p',
  className,
  children,
  ...props
}) => {
  const Component = as;
  
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm', 
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colors = {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    muted: 'text-text-muted',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
  };

  return (
    <Component
      className={cn(
        sizes[size],
        weights[weight],
        colors[color],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

// Code Component
export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'inline' | 'block';
  language?: string;
}

export const Code: React.FC<CodeProps> = ({
  variant = 'inline',
  language,
  className,
  children,
  ...props
}) => {
  if (variant === 'block') {
    return (
      <pre
        className={cn(
          'bg-surface-secondary rounded-lg p-4 overflow-x-auto',
          'border border-border-secondary',
          'text-sm font-mono',
          className
        )}
        {...props}
      >
        <code className="text-text-primary">{children}</code>
      </pre>
    );
  }

  return (
    <code
      className={cn(
        'bg-surface-secondary px-1.5 py-0.5 rounded',
        'text-sm font-mono text-text-primary',
        'border border-border-secondary',
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
};

// Label Component
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Label: React.FC<LabelProps> = ({
  required,
  size = 'md',
  className,
  children,
  ...props
}) => {
  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <label
      className={cn(
        'block font-medium text-text-primary',
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error-500 ml-1">*</span>}
    </label>
  );
};
