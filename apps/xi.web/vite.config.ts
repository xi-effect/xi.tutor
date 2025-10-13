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
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
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
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Выделяем node_modules в отдельные чанки
            if (id.includes('node_modules')) {
              // React и связанные библиотеки
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              // Router и query
              if (id.includes('@tanstack')) {
                return 'vendor-router';
              }
              // UI библиотеки
              if (id.includes('@xipkg')) {
                return 'vendor-ui';
              }
              // Board библиотеки (самые тяжелые) - разделяем дальше
              if (id.includes('tldraw')) {
                return 'vendor-tldraw';
              }
              if (id.includes('@hocuspocus') || id.includes('yjs') || id.includes('y-utility')) {
                return 'vendor-collaboration';
              }
              if (id.includes('zustand')) {
                return 'vendor-state';
              }
              // Дополнительные тяжелые библиотеки
              if (id.includes('pica') || id.includes('webpfy')) {
                return 'vendor-image-processing';
              }
              // Calls библиотеки
              if (id.includes('livekit') || id.includes('framer-motion')) {
                return 'vendor-calls';
              }
              // Editor библиотеки
              if (id.includes('@tiptap') || id.includes('prosemirror')) {
                return 'vendor-editor';
              }
              // i18n библиотеки
              if (id.includes('i18next')) {
                return 'vendor-i18n';
              }
              // Utils библиотеки
              if (id.includes('@dnd-kit') || id.includes('prismjs') || id.includes('pica')) {
                return 'vendor-utils';
              }
              // Остальные node_modules
              return 'vendor-misc';
            }

            // Выделяем модули приложения
            if (id.includes('modules.board')) return 'modules-board';
            if (id.includes('modules.calls')) return 'modules-calls';
            if (id.includes('modules.editor')) return 'modules-editor';
            if (id.includes('modules.navigation')) return 'modules-navigation';
            if (id.includes('pages.main')) return 'pages-main';
            if (id.includes('pages.classroom')) return 'pages-classroom';
            if (id.includes('pages.classrooms')) return 'pages-classrooms';
            if (id.includes('pages.welcome')) return 'pages-welcome';
            if (id.includes('pages.materials')) return 'pages-materials';
            if (id.includes('pages.payments')) return 'pages-payments';

            // Common пакеты
            if (id.includes('common.')) return 'common';
            if (id.includes('features.')) return 'features';
          },
        },
      },
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
      dedupe: ['react', 'react-dom'],
    },
    css: {
      // Оптимизация CSS
      devSourcemap: false,
    },
  };
});
