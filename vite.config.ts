import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // HMR uses eval by default, disable strict CSP during dev
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        // Avoid using eval in dev
        sourcemap: true,
        inlineDynamicImports: false,
      },
    },
  },
  base: '/eSport/', // Set base path for GitHub Pages
});
