/**
 * HMR для linked @xipkg/calls-* из соседнего репозитория xi.calls.
 * Эталон: xi.calls/docs/migrations/xi-tutor-examples/vite.calls-local.ts
 */
import path from 'node:path';
import fs from 'node:fs';
import type { UserConfig } from 'vite';
import { searchForWorkspaceRoot } from 'vite';

export type CallsDepsModeT = 'npm' | 'link';

/** Читает режим из packages/modules.calls/.calls-deps-mode (по умолчанию npm) */
export const readCallsDepsMode = (appDir: string): CallsDepsModeT => {
  const modeFile = path.resolve(appDir, '../../packages/modules.calls/.calls-deps-mode');

  try {
    const mode = fs.readFileSync(modeFile, 'utf8').trim();
    return mode === 'link' ? 'link' : 'npm';
  } catch {
    return 'npm';
  }
};

export const CALLS_PACKAGES = [
  '@xipkg/calls',
  '@xipkg/calls-chat',
  '@xipkg/calls-compactview',
  '@xipkg/calls-config',
  '@xipkg/calls-hooks',
  '@xipkg/calls-providers',
  '@xipkg/calls-risehand',
  '@xipkg/calls-store',
  '@xipkg/calls-types',
  '@xipkg/calls-ui',
  '@xipkg/calls-utils',
] as const;

/** Транзитивные runtime-deps calls-пакетов — пре-бандлим сразу, иначе Vite
 *  дооптимизирует их при первом заходе на ВКС и ломает lazy-import layout. */
export const CALLS_RUNTIME_DEPS = [
  'livekit-client',
  '@livekit/components-react',
  '@livekit/components-core',
  '@livekit/track-processors',
  '@livekit/krisp-noise-filter',
  '@dnd-kit/core',
  '@dnd-kit/modifiers',
  '@dnd-kit/utilities',
  '@react-hook/latest',
  'framer-motion',
  'zustand',
  'driver.js',
] as const;

/** @param appDir — __dirname из apps/xi.web (где лежит vite.config.ts) */
export const callsLocalDevConfig = (appDir: string): UserConfig => {
  // apps/xi.web → xi.tutor → xi.effect → xi.calls
  const xiCallsRoot = path.resolve(appDir, '../../../xi.calls');
  const callsPackagesRoot = path.join(xiCallsRoot, 'packages');

  return {
    resolve: {
      conditions: ['development', 'import'],
      dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
      preserveSymlinks: false,
      // calls-ui импортирует Switch из switcher@3; в xi.tutor hoisted switcher@4 (Switcher)
      alias: {
        '@xipkg/switcher': path.join(xiCallsRoot, 'node_modules/@xipkg/switcher'),
      },
    },
    optimizeDeps: {
      exclude: [...CALLS_PACKAGES],
      entries: [
        path.join(appDir, 'index.html'),
        path.resolve(appDir, '../../packages/modules.calls/index.ts'),
      ],
    },
    server: {
      fs: {
        allow: [searchForWorkspaceRoot(appDir), callsPackagesRoot, xiCallsRoot],
      },
      watch: {
        ignored: ['**/node_modules/**', '!**/node_modules/@xipkg/**'],
      },
    },
  };
};
