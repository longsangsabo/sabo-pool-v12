import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [react()];

  if (mode === 'development') {
    import('lovable-tagger')
      .then(mod => {
        if (mod.componentTagger) plugins.push(mod.componentTagger());
      })
      .catch(() => {});
  }

  if (mode === 'analyze') {
    import('rollup-plugin-visualizer')
      .then(mod => {
        if (mod.visualizer) {
          plugins.push(
            mod.visualizer({
              filename: 'dist/stats.html',
              open: true,
              gzipSize: true,
              brotliSize: true,
            })
          );
        }
      })
      .catch(() => {});
  }

  return {
    base: '/', // Remove base path to fix routing issues
    server: {
      host: "::",
      port: 8080, // ✅ Updated to match Loveable requirement
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@tournament": path.resolve(__dirname, "./src/components/tournament"),
      },
    },
    define: {
      'process.env': process.env,
    },
    build: {
      rollupOptions: {
        output: {
          // ❌ DISABLED ALL MANUAL CHUNKING - Fix initialization errors
          // Manual chunking can cause 'ft' initialization, createContext, 'As' initialization errors
          // Let Vite handle automatic chunking for better stability
          
          // manualChunks: undefined, // Explicitly disable manual chunking
          
          // Ensure proper asset file naming
          assetFileNames: (assetInfo: any) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
      chunkSizeWarningLimit: 1000,
      // Enable build optimizations
      target: 'esnext',
      minify: 'esbuild',
      // Split CSS
      cssCodeSplit: true,
      // Ensure assets are properly identified
      assetsDir: 'assets',
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});
