import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
  },
  build: {
    // Target modern browsers — avoids unnecessary syntax down-transpilation.
    target: 'esnext',
    // Use terser for better minification in production
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log statements in production
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Suppress warnings for large vendor chunks we intentionally split
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor libraries into separate cacheable chunks.
        // These rarely change so browsers cache them aggressively.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core — smallest, must load first
            if (id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Redux ecosystem
            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('immer')) {
              return 'redux-vendor';
            }
            // Animation + Icons (large vendor libs)
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // Charting library — large, changes independently
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) {
              return 'chart-vendor';
            }
            // HTTP client — small but frequently used, keep separate
            if (id.includes('axios')) {
              return 'http-vendor';
            }
          }
        },
      },
    },
  },
})
