import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),       // 👈 adds React JSX transform support
    tailwindcss(), // 👈 keeps Tailwind working
  ],
})
