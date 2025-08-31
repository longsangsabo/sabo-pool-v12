import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
 className?: string;
 size?: 'sm' | 'md' | 'lg';
 variant?: 'icon' | 'button' | 'compact';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
 className = '', 
 size = 'md',
 variant = 'icon'
}) => {
 const { theme, toggleTheme } = useTheme();

 const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg'
 };

 const buttonClasses = `
  ${sizeClasses[size]}
  flex items-center justify-center
  rounded-lg
  transition-all duration-200
  border
  focus:outline-none focus:ring-2 focus:ring-offset-2
  ${theme === 'light' 
   ? 'bg-white/90 border-white/40 text-slate-700 hover:bg-white focus:ring-blue-500' 
   : 'bg-neutral-800 border-gray-600 text-gray-200 hover:bg-gray-700 focus:ring-blue-400'
  }
  ${className}
 `;

 const compactButtonClasses = `
  px-3 py-1.5
  flex items-center gap-2
  rounded-md
  text-body-small-medium
  transition-all duration-200
  border
  focus:outline-none focus:ring-2 focus:ring-offset-2
  ${theme === 'light'
   ? 'bg-white/90 border-white/40 text-slate-700 hover:bg-white focus:ring-blue-500'
   : 'bg-neutral-800 border-gray-600 text-gray-200 hover:bg-gray-700 focus:ring-blue-400'
  }
  ${className}
 `;

 if (variant === 'button') {
  return (
   <Button
    onClick={toggleTheme}
    className={`
     px-4 py-2
     flex items-center gap-2
     rounded-lg
     font-medium
     transition-all duration-200
     border
     focus:outline-none focus:ring-2 focus:ring-offset-2
     ${theme === 'light'
      ? 'bg-white/90 border-white/40 text-slate-700 hover:bg-white focus:ring-blue-500'
      : 'bg-neutral-800 border-gray-600 text-gray-200 hover:bg-gray-700 focus:ring-blue-400'
     }
     ${className}
    `}
    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
   >
    {theme === 'light' ? (
     <>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      Dark Mode
     </>
    ) : (
     <>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      Light Mode
     </>
    )}
   </Button>
  );
 }

 if (variant === 'compact') {
  return (
   <Button
    onClick={toggleTheme}
    className={compactButtonClasses}
    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
   >
    {theme === 'light' ? (
     <>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      Dark
     </>
    ) : (
     <>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      Light
     </>
    )}
   </Button>
  );
 }

 // Default icon variant
 return (
  <Button
   onClick={toggleTheme}
   className={buttonClasses}
   aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
  >
   {theme === 'light' ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
   ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
   )}
  </Button>
 );
};
