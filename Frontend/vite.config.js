import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // Base path — '/' for dev, adjust to '/subpath/' if deploying under a sub-directory
  base: '/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Pre-bundle these deps so Vite doesn't re-discover them on first page load
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-toastify',
      'framer-motion',
      'swiper',
      'swiper/react',
      'lucide-react',
      '@heroicons/react/24/solid',
      '@heroicons/react/24/outline',
    ],
  },

  server: {
    port: 5173,
    strictPort: false,
    open: false,
    cors: true,
    proxy: process.env.BACKEND_API_URL
      ? {
          '/api': {
            target: process.env.BACKEND_API_URL,
            changeOrigin: true,
            secure: true,
            rewrite: (p) => p,
          },
        }
      : undefined,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) {
            return 'vendor-router';
          }
          // UI libraries
          if (id.includes('node_modules/react-toastify/')) {
            return 'vendor-ui';
          }
          // Icons — split to avoid one giant chunk
          if (id.includes('node_modules/@heroicons/') || id.includes('node_modules/lucide-react/') || id.includes('node_modules/react-icons/')) {
            return 'vendor-icons';
          }
          // Animation / charts / slider
          if (id.includes('node_modules/framer-motion/')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/recharts/')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/swiper/')) {
            return 'vendor-swiper';
          }
          // MUI / Emotion — only chunk if actually installed
          if (id.includes('node_modules/@mui/') || id.includes('node_modules/@emotion/')) {
            return 'vendor-mui';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    minify: 'esbuild',
    // Ensure assets are correctly hashed and placed
    assetsInlineLimit: 4096,
  },
})
