/**
 * Shared build configuration for SABO packages
 * Optimized for tree-shaking and modern bundlers
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export interface SABOPackageConfig {
  name: string;
  entry: string;
  external?: string[];
  globals?: Record<string, string>;
  formats?: ('es' | 'cjs' | 'umd')[];
}

export function createSABOPackageConfig(config: SABOPackageConfig) {
  const { 
    name, 
    entry, 
    external = [], 
    globals = {}, 
    formats = ['es', 'cjs'] 
  } = config;

  return defineConfig({
    plugins: [
      // Generate TypeScript declaration files
      dts({
        insertTypesEntry: true,
        copyDtsFiles: true,
        rollupTypes: true,
      }),
    ],
    
    build: {
      lib: {
        entry: resolve(__dirname, entry),
        name,
        formats,
        fileName: (format) => `index.${format === 'es' ? 'js' : format}`,
      },
      
      rollupOptions: {
        // Don't bundle peer dependencies
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          ...external,
        ],
        
        output: {
          // Global variables for UMD builds
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsx',
            ...globals,
          },
          
          // Preserve module structure for better tree-shaking
          preserveModules: false,
          
          // Export names for better compatibility
          exports: 'named',
          
          // Source maps for debugging
          sourcemap: true,
        },
      },
      
      // Optimize for modern browsers
      target: 'esnext',
      minify: 'terser',
    },
    
    // Enable better TypeScript support
    esbuild: {
      target: 'esnext',
      treeShaking: true,
    },
  });
}
