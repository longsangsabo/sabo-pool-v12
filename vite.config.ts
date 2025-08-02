import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/', // Remove base path to fix routing issues
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // ❌ DISABLED ALL MANUAL CHUNKING - Fix initialization errors
        // Manual chunking can cause 'ft' initialization, createContext, 'As' initialization errors
        // Let Vite handle automatic chunking for better stability
        
        // manualChunks: undefined, // Explicitly disable manual chunking
      },
    },
    chunkSizeWarningLimit: 1000,
    // Enable build optimizations
    target: 'esnext',
    minify: 'esbuild',
    // Split CSS
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
}));
