const ACTIVE_KEY = 'xi.board.images.active';
const SUSPECTS_KEY = 'xi.board.images.suspects';
const MAX_SUSPECTS = 200;

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function readList(storage: StorageLike | null, key: string): string[] {
  try {
    const raw = storage?.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeList(storage: StorageLike | null, key: string, list: string[]) {
  try {
    if (list.length === 0) storage?.removeItem(key);
    else storage?.setItem(key, JSON.stringify(list));
  } catch {
    // приватный режим / переполненное хранилище: защита просто не сработает
  }
}

/**
 * Вкладку, убитую системой (iOS jetsam), из JS не поймать: ни `onerror`, ни `pagehide`.
 * Поэтому пока картинки показываются, их список лежит в хранилище, а при штатном
 * уходе (`pagehide`, вкладка скрыта) стирается. Если при следующем запуске список
 * остался, прошлая сессия умерла, и эти картинки считаются подозрительными:
 * вместо них показываем значок сбоя, пока пользователь сам не откроет картинку.
 */
export function createImageCrashGuard(
  /** Свой у каждой вкладки (sessionStorage): живая соседняя вкладка не должна считаться сбоем. */
  activeStorage: StorageLike | null,
  /** Общий на все вкладки (localStorage). */
  suspectStorage: StorageLike | null = activeStorage,
) {
  const active = new Set<string>();
  const listeners = new Set<() => void>();
  let suspects = new Set<string>();

  const leftover = readList(activeStorage, ACTIVE_KEY);
  if (leftover.length > 0) {
    suspects = new Set(
      [...readList(suspectStorage, SUSPECTS_KEY), ...leftover].slice(-MAX_SUSPECTS),
    );
    writeList(suspectStorage, SUSPECTS_KEY, [...suspects]);
    writeList(activeStorage, ACTIVE_KEY, []);
  } else {
    suspects = new Set(readList(suspectStorage, SUSPECTS_KEY));
  }

  let version = 0;
  const notify = () => {
    version += 1;
    listeners.forEach((listener) => listener());
  };

  let paused = false;
  const persist = () => {
    writeList(activeStorage, ACTIVE_KEY, paused ? [] : [...active]);
  };

  return {
    isSuspect: (id: string) => suspects.has(id),
    /** Пользователь сам открыл картинку: даём ещё попытку. Упадёт снова, станет подозрительной. */
    clearSuspect(id: string) {
      if (!suspects.delete(id)) return;
      writeList(suspectStorage, SUSPECTS_KEY, [...suspects]);
      notify();
    },
    markActive(id: string) {
      active.add(id);
      persist();
    },
    markInactive(id: string) {
      active.delete(id);
      persist();
    },
    /** Штатный уход со страницы / скрытие вкладки: следующий запуск не сочтёт это сбоем. */
    pause() {
      paused = true;
      persist();
    },
    resume() {
      paused = false;
      persist();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getVersion: () => version,
  };
}

function getStorage(kind: 'localStorage' | 'sessionStorage'): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window[kind];
  } catch {
    return null;
  }
}

export const imageCrashGuard = createImageCrashGuard(
  getStorage('sessionStorage'),
  getStorage('localStorage'),
);

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') imageCrashGuard.pause();
    else imageCrashGuard.resume();
  });
  window.addEventListener('pagehide', () => imageCrashGuard.pause());
  window.addEventListener('pageshow', () => imageCrashGuard.resume());
}
