import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConfigEnv, defineConfig, mergeConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
// import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import Inspect from 'vite-plugin-inspect';

import {
  CALLS_PACKAGES,
  CALLS_RUNTIME_DEPS,
  callsLocalDevConfig,
  readCallsDepsMode,
} from './vite.calls-local.ts';
import { paddleOcrCjsInteropPlugin } from './vite.paddleocr.ts';
import { mathBankAssetsPlugin } from './vite.math-bank.ts';

const appDir = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode, command }: ConfigEnv) => {
  const callsDepsMode = readCallsDepsMode(appDir);
  const useCallsLink = mode === 'development' && callsDepsMode === 'link';
  const isElectron = mode === 'electron';
  const shouldMinify = mode === 'production' || isElectron;

  /**
   * Диагностика production build.
   *
   * Запуск:
   * VITE_BUILD_INSPECT=1 pnpm run build
   *
   * В CI достаточно добавить:
   * VITE_BUILD_INSPECT: "1"
   */
  const enableBuildInspect = command === 'build' && process.env.VITE_BUILD_INSPECT === '1';

  const importConditions: string[] = ['import', 'module', 'browser', 'default'];

  const resolveConditions: string[] = useCallsLink ? ['development', 'import'] : importConditions;

  const config = {
    /**
     * vite-plugin-inspect v12 использует Vite DevTools.
     *
     * withApp нужен, чтобы после успешного build получить
     * статический inspector в `.vite-inspect`.
     */
    devtools: enableBuildInspect
      ? {
          build: {
            withApp: true,
          },
        }
      : false,

    plugins: [
      paddleOcrCjsInteropPlugin(),

      mathBankAssetsPlugin(searchForWorkspaceRoot(process.cwd())),

      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),

      react(),

      // tailwindcss(),

      !isElectron &&
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          devOptions: {
            enabled: false,
          },
          manifest: {
            id: '/',
            name: 'sovlium',
            short_name: 'sovlium',
            description: 'web application for sovlium.ru',
            theme_color: '#ffffff',
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

          workbox: {
            skipWaiting: true,
            clientsClaim: true,
            cleanupOutdatedCaches: true,
            // null затирает дефолт плагина 'index.html'. Иначе Workbox регистрирует
            // NavigationRoute раньше runtimeCaching и всегда отдаёт precache HTML.
            // После деплоя это старый index.html с уже удалёнными hashed-чанками.
            navigateFallback: null,
            // Запрос документа стартует параллельно с запуском service worker.
            navigationPreload: true,
            // index.html не прекешируем: precache с directoryIndex отдаёт '/' из кэша
            // даже без navigateFallback.
            globPatterns: ['**/*.{js,css,ico,png,svg,webmanifest}'],
            globIgnores: [
              '**/*paddleocr*',
              '**/*opencv*',
              '**/*onnxruntime*',
              '**/*ort-wasm*',
              '**/*ort.bundle*',
              '**/*worker-entry*',
              '**/emoji/svg/**',

              // PaddleOCR: hashed `dist-*.js` или крупные `index-*.js`
              // не должны попадать в precache.
              '**/assets/dist-*.js',

              '**/math-bank/**',
              '**/task-bank/**',
            ],

            // Ниже ~6–24MB чанков OCR: иначе они снова попадут
            // в precache под именем index-*.js.
            maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
            runtimeCaching: [
              {
                // Документ только из сети. Кэш HTML после деплоя ссылается на
                // удалённые чанки, а на мобильных service worker чаще отдаёт его
                // из-за оборвавшегося первого запроса.
                urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
                handler: 'NetworkOnly',
              },
              {
                handler: 'NetworkOnly',
                urlPattern: /\/deployments\/.*/,
                method: 'GET',
              },
              {
                // Иконки эмодзи попадают в кэш только когда реально
                // запрошены и переиспользуются при следующих визитах.
                urlPattern: /\/emoji\/svg\/.*\.svg$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'emoji-icons',
                  expiration: {
                    maxEntries: 2000,
                    maxAgeSeconds: 60 * 60 * 24 * 30,
                  },
                },
              },
              {
                urlPattern: /\/(?:math-bank|task-bank)\/.+\.(?:json|gz)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'math-bank-assets',
                  expiration: {
                    maxEntries: 40,
                    maxAgeSeconds: 60 * 60 * 24 * 30,
                  },
                },
              },
            ],
          },
        }),

      /**
       * Включаем только диагностическим env.
       *
       * После успешного build создаст `.vite-inspect`,
       * где можно посмотреть module graph и plugin transforms.
       */
      enableBuildInspect &&
        Inspect({
          build: true,
        }),
    ].filter(Boolean),

    build: {
      chunkSizeWarningLimit: 1000,
      minify: shouldMinify,
      outDir: 'build',
      sourcemap: mode === 'debug',
      reportCompressedSize: false,

      /**
       * Встроенная диагностика Rolldown.
       *
       * bundlerTimings:
       *   ищет дорогие plugin hooks / callbacks.
       *
       * largeBarrelModules:
       *   отдельно ищет патологически большие barrel-файлы.
       *
       * sourcemapBroken:
       *   полезно для плагинов, трансформирующих код.
       */
      rolldownOptions: enableBuildInspect
        ? {
            checks: {
              bundlerTimings: true,
              largeBarrelModules: true,
              sourcemapBroken: true,
            },
          }
        : undefined,

      // iOS/Safari вместе с service worker иногда подвешивает module graph на
      // <link rel="modulepreload"> и не шлёт error. Entry не стартует — белый экран.
      // import() и preload CSS при динамических чанках остаются.
      modulePreload: false,
    },

    optimizeDeps: {
      rolldownOptions: {
        transform: {
          target: 'es2020',
        },
        resolve: {
          conditionNames: useCallsLink
            ? ['development', 'import', 'module', 'browser', 'default']
            : importConditions,
        },
      },

      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'sonner',
        'i18next',
        'react-i18next',
        'motion',
        'motion/react',
        ...(useCallsLink ? CALLS_RUNTIME_DEPS : []),
      ],

      exclude: ['@paddleocr/paddleocr-js'],
    },

    server: {
      hmr: {
        timeout: 30_000,
        overlay: false,
      },

      fs: {
        allow: [searchForWorkspaceRoot(process.cwd()), '../../packages'],
      },
    },

    resolve: {
      alias: {
        // mathlive exports only nested browser.production/development;
        // Vite conditions here omit those, so the package entry
        // can fail in `vite build`.
        mathlive: path.resolve(
          searchForWorkspaceRoot(process.cwd()),
          'node_modules/mathlive/mathlive.min.mjs',
        ),
      },

      conditions: resolveConditions,

      preserveSymlinks: false,

      dedupe: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'sonner',
        '@tanstack/react-router',
        '@tanstack/router-core',
        '@tanstack/react-store',
        'livekit-client',
        '@livekit/components-react',
        '@livekit/components-core',
        ...CALLS_PACKAGES,
      ],
    },

    css: {
      devSourcemap: false,
    },
  };

  const callsLocal = useCallsLink ? callsLocalDevConfig(appDir) : null;

  if (!callsLocal) {
    return config;
  }

  return mergeConfig(config, {
    ...callsLocal,

    optimizeDeps: {
      ...config.optimizeDeps,
      ...callsLocal.optimizeDeps,
      include: config.optimizeDeps.include,
    },
  });
});
