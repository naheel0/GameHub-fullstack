import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'vendor-ui': ['react-toastify'],
          // Icons
          'vendor-icons': ['@heroicons/react', 'lucide-react', 'react-icons'],
          // Rich content / animation
          'vendor-media': ['framer-motion', 'recharts', 'swiper'],
          // Styling
          'vendor-css': ['@emotion/react', '@emotion/styled', '@mui/material'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    minify: 'esbuild',
  },
})
