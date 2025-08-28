// vite.config.ts
import { defineConfig } from "file:///workspaces/sabo-pool-v12/node_modules/.pnpm/vite@5.4.19_@types+node@20.19.11/node_modules/vite/dist/node/index.js";
import react from "file:///workspaces/sabo-pool-v12/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.19/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/workspaces/sabo-pool-v12/apps/sabo-admin";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@/shared-ui": path.resolve(__vite_injected_original_dirname, "../../packages/shared-ui/src"),
      "@/shared-types": path.resolve(__vite_injected_original_dirname, "../../packages/shared-types/src"),
      "@/shared-utils": path.resolve(__vite_injected_original_dirname, "../../packages/shared-utils/src"),
      "@/shared-hooks": path.resolve(__vite_injected_original_dirname, "../../packages/shared-hooks/src")
    }
  },
  server: {
    host: "::",
    port: 8081,
    // Admin app runs on separate port
    strictPort: true,
    open: false
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          router: ["react-router-dom"],
          query: ["@tanstack/react-query"],
          admin: ["recharts"]
          // Admin-specific charting library
        }
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@supabase/supabase-js"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvd29ya3NwYWNlcy9zYWJvLXBvb2wtdjEyL2FwcHMvc2Fiby1hZG1pblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3dvcmtzcGFjZXMvc2Fiby1wb29sLXYxMi9hcHBzL3NhYm8tYWRtaW4vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3dvcmtzcGFjZXMvc2Fiby1wb29sLXYxMi9hcHBzL3NhYm8tYWRtaW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIFwiQC9zaGFyZWQtdWlcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi8uLi9wYWNrYWdlcy9zaGFyZWQtdWkvc3JjXCIpLFxuICAgICAgXCJAL3NoYXJlZC10eXBlc1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL3BhY2thZ2VzL3NoYXJlZC10eXBlcy9zcmNcIiksXG4gICAgICBcIkAvc2hhcmVkLXV0aWxzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vLi4vcGFja2FnZXMvc2hhcmVkLXV0aWxzL3NyY1wiKSxcbiAgICAgIFwiQC9zaGFyZWQtaG9va3NcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi8uLi9wYWNrYWdlcy9zaGFyZWQtaG9va3Mvc3JjXCIpLFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgxLCAvLyBBZG1pbiBhcHAgcnVucyBvbiBzZXBhcmF0ZSBwb3J0XG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBvcGVuOiBmYWxzZVxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgIHN1cGFiYXNlOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddLFxuICAgICAgICAgIHJvdXRlcjogWydyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgcXVlcnk6IFsnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5J10sXG4gICAgICAgICAgYWRtaW46IFsncmVjaGFydHMnXSAvLyBBZG1pbi1zcGVjaWZpYyBjaGFydGluZyBsaWJyYXJ5XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddXG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZTLFNBQVMsb0JBQW9CO0FBQzFVLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUNwQyxlQUFlLEtBQUssUUFBUSxrQ0FBVyw4QkFBOEI7QUFBQSxNQUNyRSxrQkFBa0IsS0FBSyxRQUFRLGtDQUFXLGlDQUFpQztBQUFBLE1BQzNFLGtCQUFrQixLQUFLLFFBQVEsa0NBQVcsaUNBQWlDO0FBQUEsTUFDM0Usa0JBQWtCLEtBQUssUUFBUSxrQ0FBVyxpQ0FBaUM7QUFBQSxJQUM3RTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUM3QixVQUFVLENBQUMsdUJBQXVCO0FBQUEsVUFDbEMsUUFBUSxDQUFDLGtCQUFrQjtBQUFBLFVBQzNCLE9BQU8sQ0FBQyx1QkFBdUI7QUFBQSxVQUMvQixPQUFPLENBQUMsVUFBVTtBQUFBO0FBQUEsUUFDcEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxTQUFTLGFBQWEsdUJBQXVCO0FBQUEsRUFDekQ7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
