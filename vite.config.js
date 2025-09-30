import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = env.VITE_DEV_PORT ? Number(env.VITE_DEV_PORT) : undefined
  const apiTarget = env.VITE_API_PROXY_TARGET || undefined

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      host: true,
      port,          // uses VITE_DEV_PORT if set; otherwise Vite picks automatically
      strictPort: false, // let Vite pick next free port if busy
      proxy: apiTarget
        ? {
            '/api': {
              target: apiTarget,
              changeOrigin: true,
              secure: false,
              ws: true,
            },
            '/uploads': {
              target: apiTarget,
              changeOrigin: true,
              secure: false,
            },
            '/socket.io': {
              target: apiTarget,
              changeOrigin: true,
              ws: true,
              secure: false,
            },
          }
        : undefined,
    }
  }
})