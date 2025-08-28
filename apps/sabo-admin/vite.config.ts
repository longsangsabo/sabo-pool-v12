import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@sabo/shared-ui": path.resolve(__dirname, "../../packages/shared-ui/src"),
      "@sabo/shared-types": path.resolve(__dirname, "../../packages/shared-types/src"),
      "@sabo/shared-utils": path.resolve(__dirname, "../../packages/shared-utils/src"),
      "@sabo/shared-hooks": path.resolve(__dirname, "../../packages/shared-hooks/src"),
      "@sabo/shared-auth": path.resolve(__dirname, "../../packages/shared-auth/src"),
    },
  },
  server: {
    host: "::",
    port: 8081,
    strictPort: true,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'data-layer': ['@tanstack/react-query', '@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'class-variance-authority', 'clsx'],
          'admin-charts': ['recharts'],
          'admin-tables': ['@tanstack/react-table'],
          'admin-forms': ['react-hook-form', 'zod'],
        },
        chunkFileNames: `js/[name]-[hash].js`,
        entryFileNames: `js/[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'lucide-react',
      'recharts',
      '@tanstack/react-table',
      'react-hook-form'
    ]
  },
  define: {
    __APP_TYPE__: JSON.stringify('admin'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
