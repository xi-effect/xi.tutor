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
        // Отключаем регистрацию SW в dev режиме, чтобы избежать ошибок
        devOptions: {
          enabled: false,
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB (по умолчанию 2 MB)
          runtimeCaching: [
            {
              handler: 'NetworkOnly',
              urlPattern: /\/deployments\/.*/,
              method: 'GET',
            },
          ],
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
      port: 5173, // Порт для веб-приложения
      host: true, // Разрешить доступ с других устройств в сети
      strictPort: true, // Не использовать другой порт, если 5173 занят
      watch: {
        usePolling: false, // Использовать опрос файловой системы для более надежного отслеживания изменений
        // interval: 0, // Интервал проверки изменений в миллисекундах
      },
      hmr: {
        /** держим сокет живым дольше 10 с */
        timeout: 30_000, // 🡅 можно 60 000, если часто бываете «в простое»
        overlay: false, // Отключаем оверлей ошибок для увеличения производительности
        port: 5173, // Порт для HMR WebSocket (обычно совпадает с server.port)
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
