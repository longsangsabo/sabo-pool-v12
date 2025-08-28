import React from 'react';
import { useTheme } from '@/hooks/useTheme';

export const DesktopProfileBackground: React.FC = () => {
  const { theme } = useTheme();
  if (theme !== 'dark') return null;
  return (
    <>
      <div
        className='fixed inset-0 z-0 opacity-90'
        aria-hidden='true'
        style={{
          backgroundImage:
            'url(https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo//billiards-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <div
        className='fixed inset-0 z-0 bg-gradient-to-b from-background/80 via-background/70 to-background/90'
        aria-hidden='true'
      />
    </>
  );
};

export default DesktopProfileBackground;
