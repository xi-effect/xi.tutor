import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from 'electron';
import { APP_ORIGIN } from '../shared/constants';

const here = path.dirname(fileURLToPath(import.meta.url));

export function isDev(): boolean {
  return !app.isPackaged;
}

export function getAppOrigin(): string {
  return APP_ORIGIN;
}

export function getDevRendererUrl(): string {
  return process.env.ELECTRON_RENDERER_URL?.trim() || 'http://localhost:5173';
}

export function getRemoteRendererUrl(): string | null {
  const raw = process.env.SOVLIUM_ELECTRON_REMOTE_URL?.trim();
  return raw ? raw.replace(/\/$/, '') : null;
}

export function isRemoteMode(): boolean {
  return Boolean(getRemoteRendererUrl());
}

export function isBundledWebMode(): boolean {
  return app.isPackaged && !isRemoteMode();
}

export function getMainDir(): string {
  return here;
}

export function getPreloadPath(): string {
  return path.join(here, '..', 'preload', 'index.cjs');
}

export function getResourcesDir(): string {
  if (app.isPackaged) {
    return process.resourcesPath;
  }
  return path.resolve(here, '../../resources');
}

export function getAllowedDevOrigins(): string[] {
  return ['http://localhost:5173', 'http://127.0.0.1:5173'];
}
