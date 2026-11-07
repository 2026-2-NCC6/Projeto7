import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.SMASH_API_TARGET || 'http://127.0.0.1:3000';

  return {
    plugins: [react()],
    resolve: {
      alias: { '@app': fileURLToPath(new URL('../src', import.meta.url)) },
    },
    server: {
      port: 5173,
      host: true,
      fs: { allow: ['..'] },
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
