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
    port: 8081, // Admin app runs on separate port
    strictPort: true,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          admin: ['recharts'] // Admin-specific charting library
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js']
  }
})
