import React from 'react';

interface DynamicStyleProps {
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
  component?: keyof JSX.IntrinsicElements;
}

/**
 * Utility component to handle dynamic styles with CSS custom properties
 * Use this for complex inline styles that cannot be easily converted to classes
 */
export const DynamicStyle: React.FC<DynamicStyleProps> = ({
  style = {},
  className = '',
  children,
  component: Component = 'div'
}) => {
  return (
    <Component 
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
};
