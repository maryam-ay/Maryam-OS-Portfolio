import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        // The portfolio is index-os.html, not index.html. Without this Vite
        // builds only the default index.html (the old React scaffold) and
        // index-os.html never reaches dist/, so a deploy serves the scaffold
        // and its redirect 404s. The scaffold is deliberately not an input:
        // it is not the site, and a failure in src/ should not break a deploy.
        input: {
          portfolio: path.resolve(__dirname, 'index-os.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
