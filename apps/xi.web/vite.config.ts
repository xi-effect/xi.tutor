import { ConfigEnv, defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  return {
    plugins: [
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        devOptions: { enabled: false },

        // важно: чтобы новые версии SW активировались быстрее
        workbox: {
          skipWaiting: true,
          clientsClaim: true,

          // ❗️убираем html из прекэша
          globPatterns: ['**/*.{js,css,ico,png,svg,webmanifest}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,

          // навигации (index.html) — NetworkFirst, чтобы подтягивался свежий html
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'html',
                networkTimeoutSeconds: 3, // чтобы офлайн/плохая сеть быстрее отдавали кеш
              },
            },
            {
              handler: 'NetworkOnly',
              urlPattern: /\/deployments\/.*/,
              method: 'GET',
            },
          ],

          // как у тебя было
          navigateFallbackDenylist: [/^\/deployments\/.*/],
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      minify: mode === 'production',
      outDir: 'build',
      sourcemap: mode === 'debug',
      terserOptions: {
        compress: {
          drop_console: true, // Временно отключено для отладки WebP конвертации
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
      // Включаем критические зависимости для предварительной обработки
      include: ['react', 'react-dom', 'react/jsx-runtime', 'sonner', 'i18next', 'react-i18next'],
      // Принудительно предварительно обрабатываем React
      force: true,
    },
    server: {
      watch: {
        usePolling: false, // Использовать опрос файловой системы для более надежного отслеживания изменений
        // interval: 0, // Интервал проверки изменений в миллисекундах
      },
      hmr: {
        /** держим сокет живым дольше 10 с */
        timeout: 30_000, // 🡅 можно 60 000, если часто бываете «в простое»
        overlay: false, // Отключаем оверлей ошибок для увеличения производительности
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
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'sonner'],
    },
    css: {
      // Оптимизация CSS
      devSourcemap: false,
    },
  };
});
