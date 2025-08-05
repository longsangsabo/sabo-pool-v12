import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()];
  
  // Only load optional plugins when needed
  if (mode === 'development') {
    // Dynamically import componentTagger only in development
    try {
      const { componentTagger } = require("lovable-tagger");
      plugins.push(componentTagger());
    } catch (e) {
      console.warn("lovable-tagger not available, skipping");
    }
  }
  
  if (mode === 'analyze') {
    // Dynamically import visualizer only when analyzing
    try {
      const { visualizer } = require('rollup-plugin-visualizer');
      plugins.push(visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }));
    } catch (e) {
      console.warn("rollup-plugin-visualizer not available, skipping");
    }
  }

  return {
    base: '/', // Remove base path to fix routing issues
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
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
  };
});
