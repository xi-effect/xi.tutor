import { ConfigEnv, defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import type { IncomingMessage } from 'node:http';

/**
 * Rewrite `Set-Cookie` headers coming back from the production backend so they
 * can actually be stored by the WebView running on `http://localhost:1420`.
 *
 * We strip:
 *   - `Domain=...sovlium.ru` — otherwise the cookie scope is `sovlium.ru` and
 *     it's never sent back to `localhost`.
 *   - `Secure` — Safari/WKWebView refuse to persist secure cookies on plain
 *     HTTP origins, even for `localhost`.
 *   - `SameSite=None` — without `Secure` the browser rejects `SameSite=None`.
 *     We downgrade it to `Lax` which is what we want for first-party calls.
 */
function rewriteSetCookies(proxyRes: IncomingMessage): void {
  const setCookie = proxyRes.headers['set-cookie'];
  if (!setCookie) return;
  proxyRes.headers['set-cookie'] = setCookie.map((cookie) =>
    cookie
      .replace(/;\s*Domain=[^;]+/i, '')
      .replace(/;\s*Secure/i, '')
      .replace(/;\s*SameSite=None/i, '; SameSite=Lax'),
  );
}

// Tauri injects TAURI_ENV_* during `tauri dev|build`. We reuse them to pick a
// safe JS target per native WebView (WebView2 on Windows, WKWebView on macOS/iOS,
// WebView on Android).
const tauriPlatform = process.env.TAURI_ENV_PLATFORM;
const tauriDevHost = process.env.TAURI_DEV_HOST;

// macOS/iOS use WKWebView (Safari-based); Windows uses Edge WebView2; Linux WebKitGTK.
// See https://v2.tauri.app/concept/build-systems/#vite for the recommended targets.
const esbuildTarget =
  tauriPlatform === 'windows' || tauriPlatform === 'linux' ? 'chrome105' : 'safari14';

const webSrc = path.resolve(__dirname, '../xi.web/src');

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  return {
    // Vite output dir is consumed by Tauri as `frontendDist`.
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    // Reuse xi.web's static assets (favicons, fonts, sounds, tldraw, etc.)
    // instead of duplicating them. Anything placed in `apps/xi.web/public/`
    // is served at `/<file>` exactly like in the web app.
    publicDir: path.resolve(__dirname, '../xi.web/public'),
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        // We reuse xi.web's filesystem-based routes so that all pages stay in one
        // place. Generated route tree is also written back into xi.web/src, which
        // is fine because that file is gitignored-ish (regenerated on dev) — see
        // xi.web/tsr.config.json. We point to the same dir explicitly to avoid
        // surprises when Vite is launched from this app's directory.
        routesDirectory: path.resolve(webSrc, 'pages'),
        generatedRouteTree: path.resolve(webSrc, 'routeTree.gen.ts'),
        quoteStyle: 'single',
        routeFileIgnorePrefix: '-',
      }),
      react(),
      tailwindcss(),
    ],
    build: {
      target: esbuildTarget,
      chunkSizeWarningLimit: 1000,
      // Tauri ships a production bundle; minify in release mode to keep installers small.
      minify: mode === 'production' ? 'esbuild' : false,
      outDir: 'build',
      sourcemap: mode === 'debug' || mode === 'development',
      emptyOutDir: true,
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
      },
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'sonner',
        'i18next',
        'react-i18next',
        'livekit-client',
        '@livekit/components-react',
        '@livekit/components-core',
      ],
      force: true,
    },
    server: {
      // Tauri dev expects a strict, well-known port.
      port: 1420,
      strictPort: true,
      host: tauriDevHost ?? '0.0.0.0',
      hmr: tauriDevHost
        ? {
            protocol: 'ws',
            host: tauriDevHost,
            port: 1421,
          }
        : {
            timeout: 30_000,
            overlay: false,
          },
      watch: {
        // Don't watch Rust artifacts; they're owned by `tauri dev`.
        ignored: ['**/src-tauri/**'],
        usePolling: false,
      },
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd()), '../../packages', '../xi.web'],
      },
      // Proxy API calls to the real backend so CORS is not an issue in dev.
      //
      // Why this is needed: in `tauri dev` the WebView loads from
      // http://localhost:1420, but the production API only allows a fixed
      // list of origins (app.sovlium.ru). We solve this with a server-side
      // proxy here that:
      //
      //   1. Spoofs `Origin: https://app.sovlium.ru` on outgoing requests
      //      so the backend's CORS allowlist accepts them.
      //   2. Rewrites incoming `Set-Cookie` headers — strips the `Secure`
      //      flag and the production domain — so WKWebView actually stores
      //      the session cookie for `http://localhost:1420`. Without this,
      //      Safari/WKWebView silently drops `Secure` cookies on plain HTTP
      //      origins and every request after login still goes anonymous.
      //
      // In production the WebView uses the `tauri://` scheme, which is a
      // secure context — none of this is needed there.
      proxy: {
        '/api': {
          target: 'https://api.sovlium.ru',
          changeOrigin: true,
          secure: true,
          headers: { Origin: 'https://app.sovlium.ru' },
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              rewriteSetCookies(proxyRes);
            });
          },
        },
        '/socket.io': {
          target: 'wss://api.sovlium.ru',
          changeOrigin: true,
          secure: true,
          ws: true,
          headers: { Origin: 'https://app.sovlium.ru' },
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              rewriteSetCookies(proxyRes);
            });
          },
        },
        // Hocus (Yjs collaboration backend) — board / notes / editor.
        // Hocus accepts WebSocket connections on the root path, so we strip
        // the `/hocus` prefix before forwarding.
        '/hocus': {
          target: 'wss://hocus.sovlium.ru',
          changeOrigin: true,
          secure: true,
          ws: true,
          rewrite: (p) => p.replace(/^\/hocus/, ''),
          headers: { Origin: 'https://app.sovlium.ru' },
        },
      },
    },
    resolve: {
      alias: {
        // Reuse xi.web sources without touching its package boundary.
        // Use as: `import { AppProviders } from 'web/providers';`
        web: webSrc,
      },
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
      ],
    },
    css: {
      devSourcemap: false,
    },
  };
});
