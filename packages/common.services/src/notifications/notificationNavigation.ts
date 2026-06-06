export type NotificationRouterNavigateOptions = {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
};

export type NotificationRouterNavigate = (options: NotificationRouterNavigateOptions) => void;

type ParsedNotificationUrl = NotificationRouterNavigateOptions;

function splitPathAndSearch(pathWithOptionalQuery: string): {
  pathname: string;
  searchPart: string;
} {
  const queryIndex = pathWithOptionalQuery.indexOf('?');
  const pathname =
    queryIndex >= 0 ? pathWithOptionalQuery.slice(0, queryIndex) : pathWithOptionalQuery;
  const searchPart = queryIndex >= 0 ? pathWithOptionalQuery.slice(queryIndex + 1) : '';
  return { pathname, searchPart };
}

function isInAppNotificationPath(pathname: string): boolean {
  return (
    /^\/classrooms\/\d+\/?$/.test(pathname) || pathname === '/payments' || pathname === '/payments/'
  );
}

export function parseNotificationUrl(url: string): ParsedNotificationUrl | 'external' | null {
  const trimmed = url.trim();
  let pathname: string;
  let searchPart: string;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (!isInAppNotificationPath(parsed.pathname)) {
        return 'external';
      }
      pathname = parsed.pathname;
      searchPart = parsed.search.startsWith('?') ? parsed.search.slice(1) : parsed.search;
    } catch {
      return 'external';
    }
  } else {
    const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    ({ pathname, searchPart } = splitPathAndSearch(normalized));
  }

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

  return null;
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
