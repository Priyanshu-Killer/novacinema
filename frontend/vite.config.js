import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: mode === 'development' ? {
      '/api': {
        target: 'https://novacinema-l2u7.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://novacinema-l2u7.onrender.com',
        ws: true,
        changeOrigin: true,
      }
    } : {}
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
}))