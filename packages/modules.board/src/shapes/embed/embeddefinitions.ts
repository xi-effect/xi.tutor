import type { DrEmbedDefinition, DrEmbedShapePermissions } from '@ibodr/draw';
import {
  EMBED_PROVIDERS,
  EMBED_PROVIDER_DEFAULT_SIZES,
  EMBED_VIDEO_PROVIDERS,
  resolveEmbedUrl,
} from 'modules.embed';

const PERMISSIONS = {
  'allow-scripts': true,
  'allow-same-origin': true,
  'allow-forms': true,
  'allow-popups': true,
  'allow-popups-to-escape-sandbox': true,
  'allow-presentation': true,
  'allow-modals': false,
  'allow-downloads': false,
} as unknown as DrEmbedShapePermissions;

const withBareHosts = (hosts: readonly string[]) =>
  Array.from(new Set([...hosts, ...hosts.map((h) => h.replace(/^www\./, ''))]));

export const boardEmbedDefinitions: readonly DrEmbedDefinition[] = EMBED_PROVIDERS.map((p) => {
  const isVideo = EMBED_VIDEO_PROVIDERS.has(p.id);
  const resolve = (url: string) => {
    const r = resolveEmbedUrl(url);
    return r.ok && r.embed.provider === p.id ? r.embed : undefined;
  };

  return {
    type: p.id,
    title: p.label,
    hostnames: withBareHosts(p.hosts),
    ...EMBED_PROVIDER_DEFAULT_SIZES[p.id],
    minWidth: 240,
    minHeight: 140,
    doesResize: true,
    isAspectRatioLocked: isVideo,
    embedOnPaste: isVideo,
    overridePermissions: PERMISSIONS,
    toEmbedUrl: (url: string) => resolve(url)?.src,
    fromEmbedUrl: (url: string) => resolve(url)?.openUrl,
  } satisfies DrEmbedDefinition;
});
