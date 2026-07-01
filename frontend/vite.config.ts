import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const apiUrl = process.env.VITE_API_URL?.trim();
if (process.env.NODE_ENV === 'production' && !apiUrl) {
  console.warn(
    '\n[vite] VITE_API_URL не задан — в production запросы пойдут на домен фронта, а не на API.\n' +
      '       Railway: Variables → VITE_API_URL = https://ваш-backend.up.railway.app\n'
  );
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    assetsInlineLimit: 0
  }
});

