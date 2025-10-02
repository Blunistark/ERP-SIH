import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    proxy: {
      // proxy all /webhook/* requests to your local n8n instance
      '/webhook': {
        target: 'http://localhost:32770/webhook',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/webhook/, ''),
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
