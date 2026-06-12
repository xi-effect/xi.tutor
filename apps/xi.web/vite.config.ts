import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConfigEnv, defineConfig, mergeConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import {
  CALLS_PACKAGES,
  CALLS_RUNTIME_DEPS,
  callsLocalDevConfig,
  readCallsDepsMode,
} from './vite.calls-local';

const appDir = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  const callsDepsMode = readCallsDepsMode(appDir);
  const useCallsLink = mode === 'development' && callsDepsMode === 'link';

  const importConditions: string[] = ['import', 'module', 'browser', 'default'];
  const resolveConditions: string[] = useCallsLink ? ['development', 'import'] : importConditions;

  const config = {
    plugins: [
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        devOptions: { enabled: false },
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
          mode: 'development',
          skipWaiting: true,
          clientsClaim: true,
          globPatterns: ['**/*.{js,css,ico,png,svg,webmanifest}', '**/index.html'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/deployments\/.*/],
          runtimeCaching: [
            {
              urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'html',
                networkTimeoutSeconds: 3,
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
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
        conditions: useCallsLink
          ? ['development', 'import', 'module', 'browser', 'default']
          : importConditions,
      },
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'sonner',
        'i18next',
        'react-i18next',
        ...(useCallsLink ? CALLS_RUNTIME_DEPS : []),
      ],
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
      alias: {},
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
