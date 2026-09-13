import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import { getResourcesDir, isDev } from './config';

function hasIndexHtml(dir: string): boolean {
  try {
    return fs.existsSync(path.join(dir, 'index.html'));
  } catch {
    return false;
  }
}

/**
 * Resolves the local xi.web bundle.
 *
 * Future updater can drop a verified bundle into `userData/web-cache/current`.
 * Until a signed feed exists we never download remote JS — bundled web is the
 * only production source, with an optional verified cache in front of it.
 */
export function resolveWebBundle(): string {
  const cached = path.join(app.getPath('userData'), 'web-cache', 'current');
  if (hasIndexHtml(cached)) {
    return cached;
  }

  const bundled = app.isPackaged
    ? path.join(process.resourcesPath, 'web')
    : path.resolve(getResourcesDir(), '../..', 'xi.web', 'build');

  if (hasIndexHtml(bundled)) {
    return bundled;
  }

  if (isDev()) {
    const webBuild = path.resolve(getResourcesDir(), '../../xi.web/build');
    if (hasIndexHtml(webBuild)) return webBuild;
  }

  throw new Error(
    `[xi.electron] web bundle is missing. Expected index.html in ${bundled}. Run pnpm --filter xi.web build:electron.`,
  );
}
