import React from 'react';

interface DynamicSizerProps {
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  aspectRatio?: string;
  className?: string;
  children: React.ReactNode;
}

export const DynamicSizer: React.FC<DynamicSizerProps> = ({
  width,
  height,
  maxWidth,
  maxHeight,
  aspectRatio,
  className = '',
  children
}) => {
  const dynamicStyles: React.CSSProperties = {};

  if (width) dynamicStyles.width = width;
  if (height) dynamicStyles.height = height;
  if (maxWidth) dynamicStyles.maxWidth = maxWidth;
  if (maxHeight) dynamicStyles.maxHeight = maxHeight;
  if (aspectRatio) dynamicStyles.aspectRatio = aspectRatio;

  return (
    <div
      className={`inline-block ${className}`}
      style={dynamicStyles}
    >
      {children}
    </div>
  );
};
