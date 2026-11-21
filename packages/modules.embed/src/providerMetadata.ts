import type { EmbedProviderId } from './types';

export const EMBED_PROVIDER_DEFAULT_SIZES: Record<
  EmbedProviderId,
  { width: number; height: number }
> = {
  youtube: { width: 560, height: 315 },
  rutube: { width: 560, height: 315 },
  vk: { width: 560, height: 315 },
  figma: { width: 800, height: 450 },
  'google-docs': { width: 720, height: 540 },
  'google-maps': { width: 600, height: 450 },
  miro: { width: 800, height: 500 },
  codepen: { width: 700, height: 450 },
  'yandex-docs': { width: 800, height: 600 },
  wordwall: { width: 640, height: 480 },
  abctest: { width: 640, height: 480 },
  quizlet: { width: 700, height: 500 },
  learningapps: { width: 700, height: 500 },
  genially: { width: 800, height: 500 },
  padlet: { width: 800, height: 600 },
  canva: { width: 800, height: 500 },
  phet: { width: 800, height: 600 },
};

export const EMBED_VIDEO_PROVIDERS: ReadonlySet<EmbedProviderId> = new Set([
  'youtube',
  'rutube',
  'vk',
]);
