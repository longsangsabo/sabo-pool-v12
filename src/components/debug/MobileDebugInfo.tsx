import React from 'react';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MobileDebugInfo: React.FC = () => {
  const { isMobile, isTablet, isDesktop, breakpoint, width, height } =
    useOptimizedResponsive();

  return (
    <Card className='fixed top-20 right-4 z-50 bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg max-w-xs'>
      <CardHeader className='p-3'>
        <CardTitle className='text-xs'>📱 Mobile Debug Info</CardTitle>
      </CardHeader>
      <CardContent className='p-3 pt-0 space-y-1 text-xs'>
        <div>
          Screen: {width}x{height}
        </div>
        <div>
          Breakpoint: <strong>{breakpoint}</strong>
        </div>
        <div>States:</div>
        <div className='ml-2'>
          <div
            className={isMobile ? 'text-green-600 font-bold' : 'text-gray-400'}
          >
            📱 Mobile: {isMobile ? 'TRUE' : 'false'}
          </div>
          <div
            className={isTablet ? 'text-blue-600 font-bold' : 'text-gray-400'}
          >
            📟 Tablet: {isTablet ? 'TRUE' : 'false'}
          </div>
          <div
            className={
              isDesktop ? 'text-purple-600 font-bold' : 'text-gray-400'
            }
          >
            🖥️ Desktop: {isDesktop ? 'TRUE' : 'false'}
          </div>
        </div>
        <div className='mt-2 pt-2 border-t'>
          <div>User Agent:</div>
          <div className='text-[10px] text-muted-foreground truncate'>
            {navigator.userAgent.slice(0, 50)}...
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileDebugInfo;
