import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ERASER_CATEGORIES } from '../config';
import { areAllEraserCategoriesEnabled } from '../utils/areAllEraserCategoriesEnabled';

type EraserSettingsT = Record<string, boolean>;

const DEFAULT_ERASER_SETTINGS: EraserSettingsT = {
  text: true,
  images: true,
  files: true,
  shapes: true,
  stickers: true,
  frames: true,
  arrows: true,
  lines: true,
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

      isTypeErasable: (shapeType) => {
        const settings = get().settings;

        const category = ERASER_CATEGORIES.find(({ types }) => types.includes(shapeType));

        if (!category) {
          return true;
        }

        return settings[category.key];
      },
    }),
    {
      name: 'board-eraser-settings',
    },
  ),
);
