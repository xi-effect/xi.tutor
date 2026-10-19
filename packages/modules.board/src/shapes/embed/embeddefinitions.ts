import type { DrEmbedDefinition, DrEmbedShapePermissions } from '@ibodr/draw';
import { EMBED_PROVIDERS, resolveEmbedUrl } from './embedProviders';
import type { EmbedProviderId } from './types';

const SIZES: Record<EmbedProviderId, { width: number; height: number }> = {
  youtube: { width: 560, height: 315 },
  rutube: { width: 560, height: 315 },
  vk: { width: 560, height: 315 },
  figma: { width: 800, height: 450 },
  'google-docs': { width: 720, height: 540 },
  'google-maps': { width: 600, height: 450 },
  miro: { width: 800, height: 500 },
  codepen: { width: 700, height: 450 },
  'yandex-docs': { width: 800, height: 600 },
};

const VIDEO = new Set<EmbedProviderId>(['youtube', 'rutube', 'vk']);

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
  const isVideo = VIDEO.has(p.id);
  const resolve = (url: string) => {
    const r = resolveEmbedUrl(url);
    return r.ok && r.embed.provider === p.id ? r.embed : undefined;
  };

  return {
    type: p.id,
    title: p.label,
    hostnames: withBareHosts(p.hosts),
    ...SIZES[p.id],
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
