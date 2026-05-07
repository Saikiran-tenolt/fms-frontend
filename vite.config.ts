import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    // Use terser for better minification in production
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log statements in production
        drop_console: true,
        drop_debugger: true,
      },
    },
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
            // Animation + Icons (largest vendor libs)
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
          }
        },
      },
    },
  },
})

