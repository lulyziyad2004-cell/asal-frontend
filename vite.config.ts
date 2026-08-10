import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
      { find: '@_core', replacement: '/src/_core' },
      { find: '@shared', replacement: '/src/shared' },
    ],
  },
});
