import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';

import { ERASER_CATEGORIES } from '../config';
import { areAllEraserCategoriesEnabled } from '../utils/areAllEraserCategoriesEnabled';

type EraserSettingsT = Record<string, boolean>;

/**
 * Картинки и файлы по умолчанию не стираются: ластик снимает рукописное,
 * а не лист под ним. Остальные категории по-прежнему включены.
 * `files` — устаревший ключ, категория называется `media`.
 */
export const DEFAULT_ERASER_SETTINGS: EraserSettingsT = Object.fromEntries(
  ERASER_CATEGORIES.map(({ key }) => [key, key !== 'images' && key !== 'media']),
);

export function isEraserTypeEnabled(settings: EraserSettingsT, shapeType: string) {
  const category = ERASER_CATEGORIES.find(({ types }) => types.includes(shapeType));
  if (!category) return true;
  return settings[category.key] === true;
}

function readSettings(persisted: unknown): EraserSettingsT {
  if (!persisted || typeof persisted !== 'object' || !('settings' in persisted)) return {};
  const settings = (persisted as { settings?: unknown }).settings;
  if (!settings || typeof settings !== 'object') return {};
  return Object.fromEntries(
    Object.entries(settings).filter((entry): entry is [string, boolean] => {
      return typeof entry[1] === 'boolean';
    }),
  );
}

/** v1 хранил дефолт «стирать всё», в том числе картинки, и ключ `files` вместо `media`. */
export function migrateEraserSettings(
  persisted: unknown,
  version: number,
): { settings: EraserSettingsT } {
  const previous = readSettings(persisted);
  const settings: EraserSettingsT = { ...DEFAULT_ERASER_SETTINGS, ...previous };

  if (version < 2 && previous.media === undefined) {
    settings.images = false;
    settings.media = false;
  }

  return {
    settings: Object.fromEntries(ERASER_CATEGORIES.map(({ key }) => [key, settings[key] === true])),
  };
}

/**
 * `createJSONStorage(() => window.localStorage)` запоминает storage в момент создания стора.
 * В тестах к этому моменту `window` уже бывает объектом без `localStorage`
 * (например, после подмены `devicePixelRatio`), и следующий `setState` падает на `setItem`.
 * Читаем хранилище на каждый вызов и молча пропускаем запись, если его нет.
 */
function activeLocalStorage(): Storage | null {
  try {
    const storage = globalThis.localStorage;
    if (
      !storage ||
      typeof storage.getItem !== 'function' ||
      typeof storage.setItem !== 'function'
    ) {
      return null;
    }
    return storage;
  } catch {
    return null;
  }
}

const eraserPersistStorage: PersistStorage<{ settings: EraserSettingsT }> = {
  getItem: (name) => {
    try {
      const raw = activeLocalStorage()?.getItem(name);
      if (!raw) return null;
      return JSON.parse(raw) as StorageValue<{ settings: EraserSettingsT }>;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      activeLocalStorage()?.setItem(name, JSON.stringify(value));
    } catch {
      /* localStorage недоступен */
    }
  },
  removeItem: (name) => {
    try {
      activeLocalStorage()?.removeItem(name);
    } catch {
      /* localStorage недоступен */
    }
  },
};

type StoreT = {
  settings: EraserSettingsT;

  toggleCategory: (key: string) => void;

  toggleAll: () => void;

  isTypeErasable: (shapeType: string) => boolean;
};

export const useEraserSettingsStore = create<StoreT>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_ERASER_SETTINGS,

      toggleCategory: (key) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: !state.settings[key],
          },
        }));
      },

      toggleAll: () => {
        set((state) => {
          const allEnabled = areAllEraserCategoriesEnabled(state.settings);

          return {
            settings: Object.fromEntries(ERASER_CATEGORIES.map(({ key }) => [key, !allEnabled])),
          };
        });
      },

      isTypeErasable: (shapeType) => isEraserTypeEnabled(get().settings, shapeType),
    }),
    {
      name: 'board-eraser-settings',
      version: 2,
      migrate: migrateEraserSettings,
      storage: eraserPersistStorage,
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
