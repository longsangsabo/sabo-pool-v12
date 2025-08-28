/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared-ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // CSS variable-based theming
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        muted: 'var(--bg-muted)',
        accent: 'var(--bg-accent)',
        card: 'var(--bg-card)',
        border: 'var(--border-primary)',
        'accent-foreground': 'var(--text-accent)',
        
        // Admin-specific color palette
        admin: {
          primary: '#2563eb', // Blue-600
          secondary: '#4b5563', // Gray-600
          success: '#059669', // Green-600
          warning: '#d97706', // Amber-600
          danger: '#dc2626', // Red-600
          dark: '#111827', // Gray-900
          darker: '#030712', // Gray-950
        },
        gray: {
          750: '#374151', // Custom gray between 700 and 800
        }
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        accent: 'var(--text-accent)',
      },
      backgroundColor: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        muted: 'var(--bg-muted)',
        accent: 'var(--bg-accent)',
        card: 'var(--bg-card)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    // Add any additional plugins for admin-specific functionality
  ],
}
