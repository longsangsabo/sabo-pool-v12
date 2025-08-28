/**
 * Shared Vite Configuration
 * Common build optimizations for all SABO Arena apps
 */

import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export interface SABOViteConfig {
  app: 'user' | 'admin';
  port: number;
  additionalAliases?: Record<string, string>;
  additionalChunks?: Record<string, string[]>;
  additionalDeps?: string[];
}

export function createSABOViteConfig(config: SABOViteConfig): UserConfig {
  const { app, port, additionalAliases = {}, additionalChunks = {}, additionalDeps = [] } = config;

  return defineConfig({
    plugins: [
      react({
        // Enable React Fast Refresh for better DX
        fastRefresh: true,
        // Optimize JSX runtime
        jsxRuntime: 'automatic',
      }),
    ],
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Use direct imports to published packages when available
        "@sabo/shared-ui": "@sabo/shared-ui",
        "@sabo/shared-types": "@sabo/shared-types",
        "@sabo/shared-utils": "@sabo/shared-utils",
        "@sabo/shared-hooks": "@sabo/shared-hooks",
        "@sabo/shared-auth": "@sabo/shared-auth",
        ...additionalAliases,
      },
    },

    server: {
      host: "::",
      port,
      strictPort: true,
      open: false,
      // Enable CORS for cross-app communication
      cors: true,
      // Proxy API calls if needed
      proxy: {
        '/api': {
          target: 'http://localhost:54321',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
      // Optimize for better performance
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          // Improved chunk splitting strategy
          manualChunks: {
            // Core framework chunks
            'react-vendor': ['react', 'react-dom'],
            'react-router': ['react-router-dom'],
            
            // Data fetching and state management
            'data-layer': ['@tanstack/react-query', '@supabase/supabase-js'],
            
            // UI component libraries
            'ui-vendor': ['lucide-react', 'class-variance-authority', 'clsx'],
            
            // SABO shared packages (bundled separately for better caching)
            'sabo-shared': [
              '@sabo/shared-types',
              '@sabo/shared-utils',
              '@sabo/shared-hooks',
              '@sabo/shared-auth',
            ],
            'sabo-ui': ['@sabo/shared-ui'],
            
            // App-specific chunks
            ...additionalChunks,
          },
          // Better file naming for caching
          chunkFileNames: (chunkInfo) => {
            return `js/[name]-[hash].js`;
          },
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
        external: (id) => {
          // Don't bundle Node.js modules
          return id.includes('node:') || 
                 (!id.startsWith('.') && !id.startsWith('/') && !id.includes('@sabo/'));
        },
      },
      // Increase chunk size warning threshold
      chunkSizeWarningLimit: 1000,
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        '@tanstack/react-query',
        'lucide-react',
        ...additionalDeps,
      ],
      // Force shared packages to be optimized
      force: true,
    },

    // Enable CSS code splitting
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCase',
      },
    },

    // Experimental features for better performance
    experimental: {
      // Enable build optimization
      buildAdvancedBaseOptions: true,
    },

    // Define environment variables
    define: {
      __APP_TYPE__: JSON.stringify(app),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },

    // Enable esbuild for faster builds
    esbuild: {
      // Drop console and debugger in production
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
      // Enable tree shaking
      treeShaking: true,
    },
  });
}
