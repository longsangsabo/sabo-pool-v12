import { ButtonVariantConfig } from './ButtonTypes';

export const buttonVariants: ButtonVariantConfig = {
  base: `
    inline-flex items-center justify-center gap-2 
    font-medium transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:pointer-events-none
    relative overflow-hidden
  `,
  
  variants: {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 
      hover:from-blue-700 hover:to-blue-800 
      text-white shadow-lg hover:shadow-xl
      focus:ring-blue-500
    `,
    
    secondary: `
      bg-gradient-to-r from-gray-100 to-gray-200 
      hover:from-gray-200 hover:to-gray-300 
      text-gray-900 border border-gray-300
      focus:ring-gray-500
    `,
    
    ghost: `
      text-gray-700 hover:bg-gray-100 
      hover:text-gray-900
      focus:ring-gray-500
    `,
    
    outline: `
      border-2 border-gray-300 text-gray-700 
      hover:bg-gray-50 hover:border-gray-400
      focus:ring-gray-500
    `,
    
    destructive: `
      bg-gradient-to-r from-red-600 to-red-700 
      hover:from-red-700 hover:to-red-800 
      text-white shadow-lg hover:shadow-xl
      focus:ring-red-500
    `,
    
    success: `
      bg-gradient-to-r from-green-600 to-green-700 
      hover:from-green-700 hover:to-green-800 
      text-white shadow-lg hover:shadow-xl
      focus:ring-green-500
    `,
    
    warning: `
      bg-gradient-to-r from-yellow-500 to-yellow-600 
      hover:from-yellow-600 hover:to-yellow-700 
      text-white shadow-lg hover:shadow-xl
      focus:ring-yellow-500
    `,
    
    tournament: `
      bg-gradient-to-r from-purple-600 to-indigo-600 
      hover:from-purple-700 hover:to-indigo-700 
      text-white shadow-lg hover:shadow-xl
      focus:ring-purple-500
      relative before:absolute before:inset-0 
      before:bg-gradient-to-r before:from-purple-400 before:to-indigo-400 
      before:opacity-0 hover:before:opacity-20 before:transition-opacity
    `,
    
    challenge: `
      bg-gradient-to-r from-orange-600 to-red-600 
      hover:from-orange-700 hover:to-red-700 
      text-white shadow-lg hover:shadow-xl
      focus:ring-orange-500
      relative before:absolute before:inset-0 
      before:bg-gradient-to-r before:from-orange-400 before:to-red-400 
      before:opacity-0 hover:before:opacity-20 before:transition-opacity
    `,
    
    'sabo-special': `
      bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
      hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 
      text-white shadow-lg hover:shadow-2xl
      focus:ring-purple-500
      relative before:absolute before:inset-0 
      before:bg-gradient-to-r before:from-indigo-400 before:via-purple-400 before:to-pink-400 
      before:opacity-0 hover:before:opacity-30 before:transition-opacity
      animate-pulse-slow
    `
  },
  
  sizes: {
    xs: 'px-2 py-1 text-xs rounded',
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-lg',
    xl: 'px-8 py-4 text-lg rounded-xl'
  },
  
  states: {
    default: '',
    loading: `
      cursor-wait
      before:absolute before:inset-0 
      before:bg-current before:opacity-10
    `,
    disabled: `
      opacity-50 cursor-not-allowed
      hover:shadow-none
    `,
    success: `
      transform scale-105 
      shadow-green-200 
      animate-bounce-once
    `,
    error: `
      transform scale-95 
      shadow-red-200 
      animate-shake
    `
  }
};

// Gaming-specific button styles
export const gamingButtonEffects = {
  pulse: 'animate-pulse',
  glow: 'shadow-lg shadow-current/25 hover:shadow-xl hover:shadow-current/40',
  tournament: 'relative before:absolute before:inset-0 before:rounded-inherit before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000',
  challenge: 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-orange-400/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700'
};
