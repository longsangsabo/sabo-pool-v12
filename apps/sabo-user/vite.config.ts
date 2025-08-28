import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/shared-ui": path.resolve(__dirname, "../../packages/shared-ui/src"),
      "@/shared-types": path.resolve(__dirname, "../../packages/shared-types/src"),
      "@/shared-utils": path.resolve(__dirname, "../../packages/shared-utils/src"),
      "@/shared-hooks": path.resolve(__dirname, "../../packages/shared-hooks/src"),
    },
  },
  server: {
    host: "::",
    port: 8080, // User app keeps the original port
    strictPort: true,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          
          // Supabase and authentication
          supabase: ['@supabase/supabase-js'],
          auth: ['@sabo/shared-auth'],
          
          // Routing
          router: ['react-router-dom'],
          
          // State management & queries
          query: ['@tanstack/react-query'],
          
          // UI libraries
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Utils and shared packages
          utils: ['@sabo/shared-utils', '@sabo/shared-types'],
          
          // Large components
          tournaments: [/src\/components\/tournament/, /src\/pages.*tournament/i],
          challenges: [/src\/components\/challenges/, /src\/pages.*challenge/i],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        }
      }
    },
    target: 'esnext',
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@supabase/supabase-js',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['@sabo/shared-ui', '@sabo/shared-types', '@sabo/shared-utils']
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  }
})
