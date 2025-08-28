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
        
        // User app color palette (gaming-focused)
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
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        accent: 'var(--text-accent)',
        foreground: 'var(--text-primary)', // Add foreground as alias
        'muted-foreground': 'var(--text-muted)', // Add muted-foreground
      },
      backgroundColor: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        muted: 'var(--bg-muted)',
        accent: 'var(--bg-accent)',
        card: 'var(--bg-card)',
      },
    },
  },
  plugins: [],
}
