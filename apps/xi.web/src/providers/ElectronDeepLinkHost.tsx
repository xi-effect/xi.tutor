import { useEffect } from 'react';
import { getSovliumDesktop, isElectronMainSurface } from 'common.platform';
import { router } from '../router';

function toRoute(path: string): { to: string; params?: Record<string, string> } | null {
  const [pathname] = path.split('?');
  const clean = pathname.replace(/\/+$/, '') || '/';

  const classroom = clean.match(/^\/classrooms?\/([^/]+)/);
  if (classroom) {
    return { to: '/classrooms/$classroomId', params: { classroomId: classroom[1] } };
  }
  if (clean.startsWith('/')) {
    return { to: clean };
  }
  return null;
}

export function ElectronDeepLinkHost() {
  useEffect(() => {
    if (!isElectronMainSurface()) return;
    const desktop = getSovliumDesktop();
    if (!desktop) return;
    return desktop.events.onDeepLink((path) => {
      const route = toRoute(path);
      if (!route) return;
      void router.navigate({
        to: route.to,
        params: route.params,
      });
    });
  }, []);

  return null;
}
