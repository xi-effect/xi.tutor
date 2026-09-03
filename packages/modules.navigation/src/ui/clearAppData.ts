const KNOWN_IDB_NAMES = ['file-upload-db', 'xi-board-doc-cache'] as const;

const deleteIndexedDb = (name: string): Promise<void> =>
  new Promise((resolve) => {
    try {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    } catch {
      resolve();
    }
  });

const clearIndexedDatabases = async (): Promise<void> => {
  const names = new Set<string>(KNOWN_IDB_NAMES);

  try {
    if (typeof indexedDB.databases === 'function') {
      const databases = await indexedDB.databases();
      for (const database of databases) {
        if (database.name) {
          names.add(database.name);
        }
      }
    }
  } catch {
    // ignore — fallback to known names
  }

  await Promise.allSettled([...names].map((name) => deleteIndexedDb(name)));
};

const clearCacheStorage = async (): Promise<void> => {
  if (!('caches' in window)) return;

  try {
    const keys = await caches.keys();
    await Promise.allSettled(keys.map((key) => caches.delete(key)));
  } catch {
    // ignore
  }
};

const unregisterServiceWorkers = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(registrations.map((registration) => registration.unregister()));
  } catch {
    // ignore
  }
};

/** Полная очистка локальных данных приложения с последующей перезагрузкой. */
export const clearAppData = async (): Promise<void> => {
  try {
    localStorage.clear();
  } catch {
    // ignore
  }

  try {
    sessionStorage.clear();
  } catch {
    // ignore
  }

  await Promise.allSettled([
    clearIndexedDatabases(),
    clearCacheStorage(),
    unregisterServiceWorkers(),
  ]);

  window.location.assign('/signin');
};
