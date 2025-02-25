import { ConfigEnv, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  return {
    plugins: [TanStackRouterVite({ autoCodeSplitting: true }), react(), tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1000,
      minify: mode === 'production',
      outDir: 'build',
      sourcemap: mode === 'debug',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
      },
    },
  };
});
