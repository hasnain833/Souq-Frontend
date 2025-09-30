import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = env.VITE_DEV_PORT ? Number(env.VITE_DEV_PORT) : undefined
  // Ensure the dev server proxies API calls to the backend when no env is set.
  // Without this, calls like `/api/user/auth/login` hit Vite itself and return 404.
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5000'

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      host: true,
      port,          // uses VITE_DEV_PORT if set; otherwise Vite picks automatically
      strictPort: false, // let Vite pick next free port if busy
      // Always configure proxy in dev so `/api` is forwarded to the backend.
      // This matches backend routes mounted in `Souq-backend-APIs-main/server.js` at `/api/user`.
      proxy: {
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
      },
    }
  }
})