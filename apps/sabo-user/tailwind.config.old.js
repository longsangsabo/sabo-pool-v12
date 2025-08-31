/** @type {import('tailwindcss').Config} */
import { sharedTailwindTheme } from '@sabo/shared-ui/theme';

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared-ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    // Use shared theme as base
    ...sharedTailwindTheme,
    
    extend: {
      // Extend with shared theme
      ...sharedTailwindTheme.extend,
      
      // User app specific extensions
      colors: {
        ...sharedTailwindTheme.extend.colors,
        
        // User app color palette (gaming-focused) - DEPRECATED, use theme vars instead
        'user-primary': {
          50: '#eff6ff',
          500: '#3b82f6', // Blue-500
          600: '#2563eb', // Blue-600
          700: '#1d4ed8', // Blue-700
        },
        'user-accent': {
          500: '#10b981', // Emerald-500 for gaming highlights
          600: '#059669', // Emerald-600
        }
      }
    },
  },
  plugins: [],
}
