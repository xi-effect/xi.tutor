export type NotificationRouterNavigateOptions = {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
};

export type NotificationRouterNavigate = (options: NotificationRouterNavigateOptions) => void;

type ParsedNotificationUrl = NotificationRouterNavigateOptions;

export function parseNotificationUrl(url: string): ParsedNotificationUrl | 'external' | null {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return 'external';
  }

  const normalized = url.startsWith('/') ? url : `/${url}`;
  const queryIndex = normalized.indexOf('?');
  const pathname = queryIndex >= 0 ? normalized.slice(0, queryIndex) : normalized;
  const searchPart = queryIndex >= 0 ? normalized.slice(queryIndex + 1) : '';

  const search: Record<string, string> = {};
  if (searchPart.length > 0) {
    new URLSearchParams(searchPart).forEach((value, key) => {
      search[key] = value;
    });
  }

  const classroomMatch = pathname.match(/^\/classrooms\/(\d+)\/?$/);
  if (classroomMatch) {
    return {
      to: '/classrooms/$classroomId',
      params: { classroomId: classroomMatch[1]! },
      search: Object.keys(search).length > 0 ? search : undefined,
    };
  }

  if (pathname === '/payments' || pathname === '/payments/') {
    return {
      to: '/payments',
      search: Object.keys(search).length > 0 ? search : undefined,
    };
  }

  const cleanPath = pathname.replace(/\/$/, '') || '/';
  return {
    to: cleanPath,
    search: Object.keys(search).length > 0 ? search : undefined,
  };
}

export function buildNotificationHref(parsed: ParsedNotificationUrl): string {
  const path = parsed.params?.classroomId ? `/classrooms/${parsed.params.classroomId}` : parsed.to;
  const query = parsed.search ? new URLSearchParams(parsed.search).toString() : '';
  return query ? `${path}?${query}` : path;
}

let registeredNavigate: NotificationRouterNavigate | null = null;

/** Регистрируется из компонента внутри RouterProvider (колокольчик в шапке). */
export function registerNotificationNavigator(navigate: NotificationRouterNavigate | null): void {
  registeredNavigate = navigate;
}

export function navigateFromNotification(url: string): void {
  const parsed = parseNotificationUrl(url);

  if (parsed === 'external') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  if (parsed == null) {
    window.location.assign(url.startsWith('/') ? url : `/${url}`);
    return;
  }

  if (registeredNavigate) {
    registeredNavigate(parsed);
    return;
  }

  window.location.assign(buildNotificationHref(parsed));
}

export function openNotificationLinkWithRouter(
  url: string,
  navigate: NotificationRouterNavigate,
): void {
  const parsed = parseNotificationUrl(url);

  if (parsed === 'external') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  if (parsed == null) {
    navigateFromNotification(url);
    return;
  }

  navigate(parsed);
}
