import { ConfigEnv, defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
// import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  return {
    plugins: [
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      minify: mode === 'production',
      outDir: 'build',
      sourcemap: mode === 'debug',
      terserOptions: {
        compress: {
          drop_console: true, // Удалит все console.*
          drop_debugger: true, // Удалит debugger
        },
      },
    },
    ssr: {
      // noExternal: ['pages.classrooms'],
    },
    optimizeDeps: {
      // exclude: ['pages.classrooms'],
      esbuildOptions: {
        target: 'es2020',
      },
      // include: ['pages.classrooms'], // Здесь можно указать пакеты, которые должны быть предварительно связаны
    },
    server: {
      watch: {
        usePolling: false, // Использовать опрос файловой системы для более надежного отслеживания изменений
        // interval: 0, // Интервал проверки изменений в миллисекундах
      },
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()), // весь workspace  [oai_citation_attribution:0‡GitHub](https://github.com/vitejs/vite/blob/main/docs/config/server-options.md?utm_source=chatgpt.com)
          '../../packages', // точечное разрешение (необязательно, но наглядно)
        ],
      },
    },
    resolve: {
      alias: {
        // импорт `@acme/ui` будет указывать прямо на исходники
        // 'pages.classrooms': path.resolve(__dirname, '../../packages/pages.classrooms/index.ts'),
      },
      // убедитесь, что symlink‑ы раскрываются ‑ это настройка по‑умолчанию
      preserveSymlinks: false,
    },
  };
});
