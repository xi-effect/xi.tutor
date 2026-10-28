import { Editor } from '@ibodr/draw';
import { MAX_INPUT_LENGTH, MAX_URL_LENGTH, VIDEO_ALLOW } from './consts';
import { EmbedErrorCode, EmbedParseResult, ProviderDef } from './types';

const PROVIDERS: readonly ProviderDef[] = [
  {
    id: 'youtube',
    label: 'YouTube',
    hosts: [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'music.youtube.com',
      'youtu.be',
      'youtube-nocookie.com',
      'www.youtube-nocookie.com',
    ],
    allow: VIDEO_ALLOW,
    resolve: (u, parts) => {
      const list = u.searchParams.get('list');
      const isPlaylistPath =
        parts[0] === 'playlist' || (parts[0] === 'embed' && parts[1] === 'videoseries');
      if (isPlaylistPath) {
        if (!list || !/^[\w-]{10,64}$/.test(list)) return null;
        return {
          src: `https://www.youtube-nocookie.com/embed/videoseries?list=${list}`,
          openUrl: `https://www.youtube.com/playlist?list=${list}`,
          w: 560,
          h: 315,
        };
      }

      let id: string | undefined;
      if (u.hostname === 'youtu.be') id = parts[0];
      else if (parts[0] === 'watch') id = u.searchParams.get('v') ?? undefined;
      else if (['embed', 'shorts', 'live', 'v'].includes(parts[0])) id = parts[1];
      if (!id || !/^[\w-]{11}$/.test(id)) return null;

      const start = parseStart(u.searchParams.get('start') ?? u.searchParams.get('t'));
      const qs = new URLSearchParams({ rel: '0' });
      if (start > 0) qs.set('start', String(start));
      return {
        // nocookie — меньше трекинга для всех, кто открыл доску
        src: `https://www.youtube-nocookie.com/embed/${id}?${qs.toString()}`,
        openUrl: `https://www.youtube.com/watch?v=${id}`,
        w: 560,
        h: 315,
      };
    },
  },
  {
    id: 'rutube',
    label: 'RUTUBE',
    hosts: ['rutube.ru', 'www.rutube.ru'],
    allow: VIDEO_ALLOW,
    resolve: (_u, parts) => {
      let id: string | undefined;
      if (parts[0] === 'video') id = parts[1];
      else if (parts[0] === 'play' && parts[1] === 'embed') id = parts[2];
      if (!id || !/^[0-9a-f]{32}$/i.test(id)) return null;
      return {
        src: `https://rutube.ru/play/embed/${id}`,
        openUrl: `https://rutube.ru/video/${id}/`,
        w: 560,
        h: 315,
      };
    },
  },
  {
    id: 'vk',
    label: 'VK Видео',
    hosts: ['vk.com', 'www.vk.com', 'vkvideo.ru', 'www.vkvideo.ru'],
    allow: VIDEO_ALLOW,
    resolve: (u, parts) => {
      // Только embed-ссылка video_ext.php (с hash) — обычные ссылки на видео не встраиваются
      if (parts.length !== 1 || parts[0] !== 'video_ext.php') return null;
      const oid = u.searchParams.get('oid');
      const id = u.searchParams.get('id');
      const hash = u.searchParams.get('hash');
      if (!oid || !/^-?\d{1,12}$/.test(oid)) return null;
      if (!id || !/^\d{1,12}$/.test(id)) return null;
      if (!hash || !/^[0-9a-f]{8,32}$/i.test(hash)) return null;
      return {
        src: `https://vk.com/video_ext.php?oid=${oid}&id=${id}&hash=${hash}`,
        openUrl: `https://vk.com/video${oid}_${id}`,
        w: 560,
        h: 315,
      };
    },
  },
  {
    id: 'figma',
    label: 'Figma',
    hosts: ['figma.com', 'www.figma.com'],
    allow: 'fullscreen; clipboard-write',
    resolve: (u, parts) => {
      let kind: string | undefined;
      let key: string | undefined;
      let nodeId: string | null = null;

      if (parts[0] === 'embed') {
        const inner = u.searchParams.get('url');
        if (!inner) return null;
        let iu: URL;
        try {
          iu = new URL(inner);
        } catch {
          return null;
        }
        if (iu.protocol !== 'https:' || !['figma.com', 'www.figma.com'].includes(iu.hostname)) {
          return null;
        }
        const ip = iu.pathname.split('/').filter(Boolean).map(safeDecode);
        kind = ip[0];
        key = ip[1];
        nodeId = iu.searchParams.get('node-id');
      } else {
        kind = parts[0];
        key = parts[1];
        nodeId = u.searchParams.get('node-id');
      }

      if (!kind || !['file', 'design', 'proto', 'board'].includes(kind)) return null;
      if (!key || !/^[A-Za-z0-9]{10,40}$/.test(key)) return null;

      const inner = new URL(`https://www.figma.com/${kind}/${key}`);
      if (nodeId && /^[\w:%-]{1,40}$/.test(nodeId)) inner.searchParams.set('node-id', nodeId);

      return {
        src: `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(inner.toString())}`,
        openUrl: inner.toString(),
        w: 800,
        h: 450,
      };
    },
  },
  {
    id: 'google-docs',
    label: 'Google Docs',
    hosts: ['docs.google.com'],
    allow: 'fullscreen',
    resolve: (_u, parts) => {
      const kind = parts[0];
      const idPattern = /^[\w-]{20,100}$/;

      if (kind === 'forms' && parts[1] === 'd' && parts[2] === 'e') {
        const id = parts[3];
        if (!id || !idPattern.test(id)) return null;
        const url = `https://docs.google.com/forms/d/e/${id}/viewform`;
        return { src: `${url}?embedded=true`, openUrl: url, w: 640, h: 600 };
      }

      if (!['document', 'presentation', 'spreadsheets'].includes(kind) || parts[1] !== 'd') {
        return null;
      }
      const id = parts[2];
      if (!id || !idPattern.test(id)) return null;

      const openUrl = `https://docs.google.com/${kind}/d/${id}/edit`;
      if (kind === 'presentation') {
        return {
          src: `https://docs.google.com/presentation/d/${id}/embed`,
          openUrl,
          w: 800,
          h: 500,
        };
      }
      return { src: `https://docs.google.com/${kind}/d/${id}/preview`, openUrl, w: 720, h: 540 };
    },
  },
  {
    id: 'google-maps',
    label: 'Google Maps',
    hosts: ['www.google.com'],
    allow: 'fullscreen',
    resolve: (u, parts) => {
      // Строго /maps/embed — остальные пути google.com (в т.ч. /url?...) не принимаем
      if (parts.length !== 2 || parts[0] !== 'maps' || parts[1] !== 'embed') return null;
      const pb = u.searchParams.get('pb');
      if (!pb || pb.length > 2500 || !/^[\w!.\-:,;=+~*@$%\s]+$/.test(pb)) return null;
      const out = new URL('https://www.google.com/maps/embed');
      out.searchParams.set('pb', pb);
      return { src: out.toString(), openUrl: 'https://www.google.com/maps', w: 600, h: 450 };
    },
  },
  {
    id: 'miro',
    label: 'Miro',
    hosts: ['miro.com', 'www.miro.com'],
    allow: 'fullscreen; clipboard-read; clipboard-write',
    resolve: (_u, parts) => {
      if (parts[0] !== 'app' || (parts[1] !== 'board' && parts[1] !== 'live-embed')) return null;
      const id = parts[2];
      if (!id || !/^[\w=-]{8,64}$/.test(id)) return null;
      return {
        src: `https://miro.com/app/live-embed/${encodeURIComponent(id)}/`,
        openUrl: `https://miro.com/app/board/${encodeURIComponent(id)}/`,
        w: 800,
        h: 500,
      };
    },
  },
  {
    id: 'codepen',
    label: 'CodePen',
    hosts: ['codepen.io'],
    allow: 'fullscreen',
    resolve: (_u, parts) => {
      const [user, kind, id] = parts;
      if (!user || !/^[\w-]{1,64}$/.test(user)) return null;
      if (kind !== 'pen' && kind !== 'embed') return null;
      if (!id || !/^[A-Za-z0-9]{5,12}$/.test(id)) return null;
      return {
        src: `https://codepen.io/${user}/embed/${id}?default-tab=result`,
        openUrl: `https://codepen.io/${user}/pen/${id}`,
        w: 700,
        h: 450,
      };
    },
  },
  {
    id: 'yandex-docs',
    label: 'Яндекс Документы',
    hosts: ['docs.yandex.ru', 'disk.yandex.ru', 'yadi.sk'],
    allow: 'fullscreen',
    resolve: (u, parts) => {
      if (u.hostname === 'docs.yandex.ru') {
        if (parts.length !== 2 || parts[0] !== 'docs' || parts[1] !== 'view') return null;
        const raw = u.searchParams.get('url')?.replace(/ /g, '+');
        if (!raw || !/^ya-disk-public:\/\/[A-Za-z0-9+/=_-]{20,300}$/.test(raw)) return null;
        const src = `https://docs.yandex.ru/docs/view?url=${encodeURIComponent(raw)}`;
        return { src, openUrl: src, w: 800, h: 600 };
      }

      let kind: string;
      let id: string | undefined;
      if (parts[0] === 'edit' && parts[1] === 'd' && parts.length === 3) {
        kind = 'edit/d';
        id = parts[2];
      } else if (parts[0] === 'i' && parts.length === 2) {
        kind = 'i';
        id = parts[1];
      } else {
        return null;
      }
      if (!id || !/^[\w-]{8,64}$/.test(id)) return null;
      const src = `https://disk.yandex.ru/${kind}/${id}`;
      return { src, openUrl: src, w: 800, h: 600 };
    },
  },
];

const HOST_INDEX = new Map<string, ProviderDef>();

export const EMBED_PROVIDERS: readonly ProviderDef[] = PROVIDERS;
export const EMBED_PROVIDER_LABELS: readonly string[] = PROVIDERS.map((p) => p.label);

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return '';
  }
}

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

function parseStart(v: string | null): number {
  if (!v) return 0;
  if (/^\d{1,6}$/.test(v)) return Number(v);
  const m = /^(?:(\d{1,3})h)?(?:(\d{1,4})m)?(?:(\d{1,5})s)?$/.exec(v);
  if (!m) return 0;
  return (Number(m[1]) || 0) * 3600 + (Number(m[2]) || 0) * 60 + (Number(m[3]) || 0);
}

for (const p of PROVIDERS) for (const h of p.hosts) HOST_INDEX.set(h, p);

const fail = (error: EmbedErrorCode): EmbedParseResult => ({ ok: false, error });

function resolveFromUrlString(raw: string): EmbedParseResult {
  if (raw.length > MAX_URL_LENGTH) return fail('too_long');
  if (/\s/.test(raw) || hasControlChars(raw)) return fail('invalid_url');

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw);
  let u: URL;
  try {
    u = new URL(hasScheme ? raw : `https://${raw}`);
  } catch {
    return fail('invalid_url');
  }

  if (u.protocol !== 'https:') return fail('insecure_protocol');
  if (u.username || u.password || u.port) return fail('forbidden_url_parts');

  const host = u.hostname.toLowerCase();
  if (host.endsWith('.')) return fail('invalid_url');
  if (typeof location !== 'undefined' && host === location.hostname) {
    return fail('forbidden_url_parts');
  }

  const provider = HOST_INDEX.get(host);
  if (!provider) return fail('unsupported_host');

  const parts = u.pathname.split('/').filter(Boolean).map(safeDecode);
  const r = provider.resolve(u, parts);
  if (!r) return fail('unsupported_link');

  try {
    const out = new URL(r.src);
    if (out.protocol !== 'https:' || out.username || out.password || out.port) {
      return fail('unsupported_link');
    }
  } catch {
    return fail('unsupported_link');
  }

  return {
    ok: true,
    embed: {
      provider: provider.id,
      label: provider.label,
      src: r.src,
      openUrl: r.openUrl ?? r.src,
      allow: provider.allow,
      w: r.w,
      h: r.h,
    },
  };
}

export function resolveEmbedUrl(url: string): EmbedParseResult {
  const input = (url ?? '').trim();
  if (!input) return fail('empty');
  if (input.startsWith('<')) return fail('unsupported_markup');
  return resolveFromUrlString(input);
}

export function parseEmbedInput(raw: string): EmbedParseResult {
  const input = (raw ?? '').trim();
  if (!input) return fail('empty');
  if (input.length > MAX_INPUT_LENGTH) return fail('too_long');

  if (input.startsWith('<')) {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    const nodes = doc.body.children;
    const first = nodes[0];
    if (nodes.length !== 1 || !first || first.tagName !== 'IFRAME') {
      return fail('unsupported_markup');
    }
    let src = (first.getAttribute('src') ?? '').trim();
    if (!src) return fail('invalid_url');
    if (src.startsWith('//')) src = `https:${src}`;
    return resolveFromUrlString(src);
  }

  return resolveFromUrlString(input);
}

export function sanitizeEmbedShape<T extends { type: string; props: object }>(shape: T): T {
  if (shape.type !== 'embed') return shape;

  const raw = (shape.props as { url?: unknown }).url;
  const url = typeof raw === 'string' ? raw : '';
  const result = resolveEmbedUrl(url);
  const safeUrl = result.ok ? result.embed.src : '';

  if (safeUrl === url) return shape;
  return { ...shape, props: { ...shape.props, url: safeUrl } };
}

export function registerEmbedGuard(editor: Editor) {
  const offCreate = editor.sideEffects.registerBeforeCreateHandler('shape', (shape) =>
    sanitizeEmbedShape(shape),
  );
  const offChange = editor.sideEffects.registerBeforeChangeHandler('shape', (_prev, next) =>
    sanitizeEmbedShape(next),
  );

  return () => {
    offCreate();
    offChange();
  };
}
