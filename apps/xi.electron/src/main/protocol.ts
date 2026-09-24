import fs from 'node:fs';
import path from 'node:path';
import type { Session } from 'electron';
import { APP_HOST } from '../shared/constants';

const MIME_BY_EXT: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.gz': 'application/gzip',
  '.br': 'application/br',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.onnx': 'application/octet-stream',
  '.bin': 'application/octet-stream',
  '.data': 'application/octet-stream',
};

const FILE_EXT_RE =
  /\.(?:js|mjs|cjs|css|json|wasm|map|svg|png|jpe?g|gif|webp|ico|woff2?|ttf|otf|eot|txt|html|gz|br|mp3|wav|mp4|webm|onnx|bin|data)$/i;

function isInsideRoot(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function mimeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (filePath.toLowerCase().endsWith('.json.gz')) return 'application/gzip';
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

function isAssetLike(pathname: string): boolean {
  if (pathname.startsWith('/assets/')) return true;
  if (pathname.startsWith('/math-bank/')) return true;
  if (pathname.startsWith('/task-bank/')) return true;
  if (pathname.startsWith('/emoji/')) return true;
  return FILE_EXT_RE.test(pathname);
}

function decodePathname(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function resolveLocalPath(bundleRoot: string, pathname: string): string | null {
  const decoded = decodePathname(pathname);
  const relative = decoded.replace(/^\/+/, '');
  const target = path.resolve(bundleRoot, relative);
  if (!isInsideRoot(bundleRoot, target)) return null;
  return target;
}

function fileResponse(filePath: string): Response {
  const body = fs.readFileSync(filePath);
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': mimeFor(filePath),
      'cache-control': filePath.endsWith('.html')
        ? 'no-cache'
        : 'public, max-age=31536000, immutable',
    },
  });
}

function notFound(): Response {
  return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } });
}

export function serveWebRequest(bundleRoot: string, requestUrl: URL): Response {
  const pathname = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;

  const direct = resolveLocalPath(bundleRoot, pathname);
  if (direct && fs.existsSync(direct) && fs.statSync(direct).isFile()) {
    return fileResponse(direct);
  }

  if (isAssetLike(pathname)) {
    return notFound();
  }

  const index = path.join(bundleRoot, 'index.html');
  if (fs.existsSync(index)) {
    return fileResponse(index);
  }

  return notFound();
}

export function createAppOriginHandler(ses: Session, bundleRoot: string) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    if (url.hostname !== APP_HOST) {
      return ses.fetch(request, { bypassCustomProtocolHandlers: true });
    }
    return serveWebRequest(bundleRoot, url);
  };
}
