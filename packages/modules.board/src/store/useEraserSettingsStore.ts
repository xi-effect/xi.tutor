import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    },
  ),
);
