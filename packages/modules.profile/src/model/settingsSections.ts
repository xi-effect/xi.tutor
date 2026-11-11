export const SETTINGS_RETURN_KEY = 'settings:return';

export type SettingsSectionId =
  | 'personalInfo'
  | 'subscription'
  | 'personalisation'
  | 'schedule'
  | 'security'
  | 'notifications'
  | 'soundAndVideo'
  | 'effects'
  | 'tags'
  | 'board'
  | 'report';

export type SettingsSection = {
  id: SettingsSectionId;
  slug: string;
  titleKey:
    | 'menu.personalInfo'
    | 'menu.subscription'
    | 'menu.personalisation'
    | 'menu.schedule'
    | 'menu.security'
    | 'menu.notifications'
    | 'menu.soundAndVideo'
    | 'menu.effects'
    | 'menu.tags'
    | 'menu.board'
    | 'menu.report';
  tutorOnly?: boolean;
  themeOnly?: boolean;
};

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  { id: 'personalInfo', slug: 'personal', titleKey: 'menu.personalInfo' },
  {
    id: 'subscription',
    slug: 'subscription',
    titleKey: 'menu.subscription',
    tutorOnly: true,
  },
  {
    id: 'personalisation',
    slug: 'appearance',
    titleKey: 'menu.personalisation',
    themeOnly: true,
  },
  { id: 'schedule', slug: 'schedule', titleKey: 'menu.schedule' },
  { id: 'security', slug: 'security', titleKey: 'menu.security' },
  { id: 'notifications', slug: 'notifications', titleKey: 'menu.notifications' },
  { id: 'soundAndVideo', slug: 'sound-and-video', titleKey: 'menu.soundAndVideo' },
  { id: 'effects', slug: 'effects', titleKey: 'menu.effects' },
  { id: 'tags', slug: 'tags', titleKey: 'menu.tags', tutorOnly: true },
  { id: 'board', slug: 'board', titleKey: 'menu.board' },
  { id: 'report', slug: 'report', titleKey: 'menu.report' },
];

export type SettingsVisibility = {
  isTutor: boolean;
  themeEnabled: boolean;
};

export type SettingsSearch = {
  call: string | undefined;
  period: string | undefined;
};

export type SettingsReturnLocation = {
  pathname: string;
  search: Record<string, unknown>;
};

export const isSettingsPath = (pathname: string) =>
  pathname === '/settings' || pathname.startsWith('/settings/');

export const visibleSettingsSections = ({ isTutor, themeEnabled }: SettingsVisibility) =>
  SETTINGS_SECTIONS.filter((section) => {
    if (section.tutorOnly && !isTutor) return false;
    if (section.themeOnly && !themeEnabled) return false;
    return true;
  });

export const resolveSettingsSlug = (value: string | undefined | null) => {
  if (!value) return 'personal';
  const bySlug = SETTINGS_SECTIONS.find((section) => section.slug === value);
  if (bySlug) return bySlug.slug;
  const byId = SETTINGS_SECTIONS.find((section) => section.id === value);
  return byId?.slug ?? 'personal';
};

export const resolveVisibleSection = (
  slug: string,
  visibility: SettingsVisibility,
): SettingsSection => {
  const visible = visibleSettingsSections(visibility);
  return visible.find((section) => section.slug === slug) ?? visible[0] ?? SETTINGS_SECTIONS[0];
};

export const settingsSectionFromPath = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'settings' || !parts[1]) return null;

  if (parts[1] === 'subscription' && parts[2] === 'payment-result') {
    return SETTINGS_SECTIONS.find((section) => section.id === 'subscription') ?? null;
  }

  if (parts.length !== 2) return null;
  return SETTINGS_SECTIONS.find((section) => section.slug === parts[1]) ?? null;
};

export const pickSettingsSearch = (search: unknown, callId?: string): SettingsSearch => {
  const source = search && typeof search === 'object' ? (search as Record<string, unknown>) : {};
  const callFromSearch = typeof source.call === 'string' ? source.call : '';
  const call = callFromSearch || callId || '';

  return {
    call: call || undefined,
    period: typeof source.period === 'string' && source.period ? source.period : undefined,
  };
};

const plainSearch = (search: unknown) => {
  if (!search || typeof search !== 'object') return {};

  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(search as Record<string, unknown>)) {
    if (key === 'profile' || value === undefined) continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      next[key] = value;
    }
  }

  return next;
};

const isSafeReturnPath = (pathname: string) =>
  pathname.startsWith('/') && !pathname.startsWith('//') && !pathname.includes('://');

export const rememberSettingsReturn = (pathname: string, search: unknown) => {
  if (typeof sessionStorage === 'undefined') return;
  if (!isSafeReturnPath(pathname) || isSettingsPath(pathname)) return;

  const payload: SettingsReturnLocation = {
    pathname,
    search: plainSearch(search),
  };

  try {
    sessionStorage.setItem(SETTINGS_RETURN_KEY, JSON.stringify(payload));
  } catch {
    // Приватный режим может запретить sessionStorage. «Назад» тогда ведёт на главную.
  }
};

export const readSettingsReturn = (): SettingsReturnLocation => {
  const fallback: SettingsReturnLocation = { pathname: '/', search: {} };
  if (typeof sessionStorage === 'undefined') return fallback;

  try {
    const raw = sessionStorage.getItem(SETTINGS_RETURN_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<SettingsReturnLocation>;
    if (typeof parsed.pathname !== 'string' || !isSafeReturnPath(parsed.pathname)) return fallback;
    if (isSettingsPath(parsed.pathname)) return fallback;

    return {
      pathname: parsed.pathname,
      search: plainSearch(parsed.search),
    };
  } catch {
    return fallback;
  }
};
