// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load all VITE_* env vars for the current mode
  const env = loadEnv(mode, process.cwd(), '');

  // Optional dev port (falls back to Vite default if not set)
  const port = env.VITE_DEV_PORT ? Number(env.VITE_DEV_PORT) : undefined;

  // In dev, proxy API to your backend
  // In prod, the frontend should call the real backend URL (via env in your code)
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      host: true,
      port,
      strictPort: false,
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
    },
    // Optional: local preview config (vite preview)
    preview: {
      host: true,
      port: 4173,
    },
    build: {
      // Quiet the “>500kB” warnings and split big libs into separate chunks
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            i18n: ['i18next', 'react-i18next'],
            ui: ['react-icons', 'lucide-react'],
            // add more buckets if needed (e.g., charting libs etc.)
          },
        },
      },
    },
  };
});
