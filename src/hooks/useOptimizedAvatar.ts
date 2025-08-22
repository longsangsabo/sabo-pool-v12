import { useState, useCallback, useEffect } from 'react';

interface UseOptimizedAvatarProps {
  src?: string | null;
  fallback?: string;
}

interface UseOptimizedAvatarReturn {
  imageSrc: string | undefined;
  isLoading: boolean;
  hasError: boolean;
  handleLoad: () => void;
  handleError: () => void;
  retry: () => void;
}

export function useOptimizedAvatar({ 
  src, 
  fallback 
}: UseOptimizedAvatarProps): UseOptimizedAvatarReturn {
  const [isLoading, setIsLoading] = useState(!!src);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Clean up the source URL
  const cleanSrc = src?.trim();
  const isValidSrc = cleanSrc && 
                     cleanSrc !== '' && 
                     cleanSrc !== 'undefined' && 
                     cleanSrc !== 'null' &&
                     (cleanSrc.startsWith('http') || cleanSrc.startsWith('/'));

  const imageSrc = hasError ? fallback : (isValidSrc ? cleanSrc : fallback);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    console.log(`Avatar failed to load: ${cleanSrc}`);
    setIsLoading(false);
    setHasError(true);
  }, [cleanSrc]);

  const retry = useCallback(() => {
    if (retryCount < 3 && isValidSrc) {
      setRetryCount(prev => prev + 1);
      setHasError(false);
      setIsLoading(true);
    }
  }, [retryCount, isValidSrc]);

  // Reset states when src changes
  useEffect(() => {
    if (isValidSrc) {
      setIsLoading(true);
      setHasError(false);
      setRetryCount(0);
    } else {
      setIsLoading(false);
      setHasError(false);
    }
  }, [src, isValidSrc]);

  return {
    imageSrc,
    isLoading,
    hasError,
    handleLoad,
    handleError,
    retry,
  };
}
