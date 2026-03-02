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

        manifest: {
          name: 'sovlium',
          short_name: 'sovlium',
          description: 'web application for sovlium.ru',
          theme_color: '#c5caee',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/web-app-manifest-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/web-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },

        // важно: чтобы новые версии SW активировались быстрее
        workbox: {
          skipWaiting: true,
          clientsClaim: true,

          // Прекэш: assets + index.html для SPA fallback при офлайн/прямых переходах на маршруты
          globPatterns: ['**/*.{js,css,ico,png,svg,webmanifest}', '**/index.html'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,

          // SPA: при навигации на /signin, /classrooms и т.д. отдавать index.html (иначе 404)
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/deployments\/.*/],

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
