import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@supabase/supabase-js'],
  },
  server: {
    host: true,
    port: 5173
  }
});