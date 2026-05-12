import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ],
  server: {
    proxy: {
      // Match docker-compose backend port; override with VITE_DEV_PROXY_TARGET if needed
      "/api": {
        target: process.env.VITE_DEV_PROXY_TARGET || "http://127.0.0.1:8080",
        changeOrigin: true,
      },
      "/uploads": {
        target: process.env.VITE_DEV_PROXY_TARGET || "http://127.0.0.1:8080",
        changeOrigin: true,
      },
      "/hubs": {
        target: process.env.VITE_DEV_PROXY_TARGET || "http://127.0.0.1:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
