import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOptimizedAvatar } from '@/hooks/useOptimizedAvatar';
import { cn } from '@/lib/utils';

interface OptimizedAvatarProps {
 src?: string | undefined;
 alt?: string;
 fallback?: string;
 className?: string;
 size?: 'sm' | 'md' | 'lg' | 'xl';
 loading?: 'eager' | 'lazy';
}

const sizeClasses = {
 sm: 'w-8 h-8',
 md: 'w-12 h-12', 
 lg: 'w-16 h-16',
 xl: 'w-24 h-24',
};

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
 src,
 alt = 'Avatar',
 fallback,
 className,
 size = 'md',
 loading = 'lazy',
}) => {
 const { imageSrc, isLoading, hasError, handleLoad, handleError } = useOptimizedAvatar({
  src,
  fallback,
 });

 return (
  <div className={cn('avatar-container relative', className)}>
   <Avatar className={cn(sizeClasses[size], 'relative overflow-hidden')}>
    {imageSrc && !hasError && (
     <AvatarImage
      src={imageSrc}
      alt={alt}
      loading={loading}
      className="avatar-image object-cover transition-opacity duration-300"
      onLoad={handleLoad}
      onError={handleError}
      data-loading={isLoading}
      data-error={hasError}
     />
    )}
    <AvatarFallback className="avatar-fallback bg-gradient-to-br from-blue-500 to-purple-600 text-var(--color-background) font-semibold">
     {fallback || alt?.[0]?.toUpperCase() || 'U'}
    </AvatarFallback>
   </Avatar>
   
   {isLoading && (
    <div className="avatar-loading" />
   )}
  </div>
 );
};
