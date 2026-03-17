import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Ensure chunk size warnings are visible
    chunkSizeWarningLimit: 1000,
  },
  // Base URL — keep as '/' for Render static site
  base: '/',
})
