import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface RainbowAvatarProps
 extends React.HTMLAttributes<HTMLDivElement> {
 src?: string;
 alt?: string;
 fallback?: string;
 size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'custom';
 variant?: 'default' | 'rainbow' | 'glow' | 'pulse' | 'shimmer';
 intensity?: 'subtle' | 'normal' | 'intense';
 speed?: 'slow' | 'normal' | 'fast';
 shape?: 'circle' | 'square' | 'octagon' | 'custom';
 customClipPath?: string;
 showBorder?: boolean;
 borderWidth?: number;
 glowColor?: string;
 children?: React.ReactNode;
}

const sizeClasses = {
 sm: 'w-8 h-8',
 md: 'w-12 h-12',
 lg: 'w-16 h-16',
 xl: 'w-24 h-24',
 '2xl': 'w-32 h-32',
 '3xl': 'w-48 h-48',
 custom: '', // Kích thước tùy chỉnh qua className
};

const shapeClipPaths = {
 circle: 'circle(50%)',
 square: 'none',
 octagon:
  'polygon(0% 10%, 10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%)',
 custom: '', // Clip path tùy chỉnh
};

const RainbowAvatar = forwardRef<HTMLDivElement, RainbowAvatarProps>(
 (
  {
   src,
   alt = 'Avatar',
   fallback,
   size = 'lg',
   variant = 'default',
   intensity = 'normal',
   speed = 'normal',
   shape = 'circle',
   customClipPath,
   showBorder = true,
   borderWidth = 4,
   glowColor,
   className,
   children,
   ...props
  },
  ref
 ) => {
  const containerClasses = cn(
   'rainbow-avatar-container relative inline-block',
   sizeClasses[size],
   className
  );

  const avatarClasses = cn(
   'w-full h-full object-cover transition-all duration-300',
   variant !== 'default' && 'rainbow-avatar-enhanced'
  );

  const clipPath = customClipPath || shapeClipPaths[shape];

  const getVariantStyles = () => {
   const baseStyle: React.CSSProperties = {
    clipPath: clipPath !== 'none' ? clipPath : undefined,
   };

   if (variant === 'default') {
    return baseStyle;
   }

   return {
    ...baseStyle,
    '--rainbow-intensity':
     intensity === 'subtle'
      ? '0.4'
      : intensity === 'intense'
       ? '0.9'
       : '0.7',
    '--rainbow-speed':
     speed === 'slow' ? '12s' : speed === 'fast' ? '4s' : '8s',
    '--rainbow-border-width': `${borderWidth}px`,
    '--rainbow-glow-color': glowColor || 'rgba(255, 255, 255, 0.5)',
   } as React.CSSProperties;
  };

  const getVariantClassName = () => {
   switch (variant) {
    case 'rainbow':
     return 'rainbow-variant';
    case 'glow':
     return 'glow-variant';
    case 'pulse':
     return 'pulse-variant';
    case 'shimmer':
     return 'shimmer-variant';
    default:
     return '';
   }
  };

  return (
   <div
    ref={ref}
    className={cn(containerClasses, getVariantClassName())}
    style={getVariantStyles()}
    {...props}
   >
    {/* Hiệu ứng viền rainbow cho variant rainbow */}
    {variant === 'rainbow' && <div className='rainbow-border-effect' />}

    {/* Hiệu ứng glow cho variant glow */}
    {variant === 'glow' && <div className='glow-effect' />}

    {/* Avatar chính */}
    {children ? (
     <div
      className={avatarClasses}
      style={{ clipPath: clipPath !== 'none' ? clipPath : undefined }}
     >
      {children}
     </div>
    ) : (
     <Avatar
      className={avatarClasses}
      style={{ clipPath: clipPath !== 'none' ? clipPath : undefined }}
     >
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-var(--color-background) font-semibold'>
       {fallback}
      </AvatarFallback>
     </Avatar>
    )}

    {/* Lớp overlay cho các hiệu ứng tương tác */}
    <div className='rainbow-avatar-overlay' />
   </div>
  );
 }
);

RainbowAvatar.displayName = 'RainbowAvatar';

export { RainbowAvatar };
