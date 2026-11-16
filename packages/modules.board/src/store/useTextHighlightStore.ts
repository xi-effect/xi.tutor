import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBoardColorOption } from '../utils/boardColors';
import {
  clampHighlightOpacity,
  DEFAULT_TEXT_HIGHLIGHT_PRESETS,
  type TextHighlightStyle,
} from '../shapes/text/highlightStyle';

type TextHighlightState = {
  presets: TextHighlightStyle[];
  activePresetIndex: number;
  setActivePreset: (index: number) => void;
  setHighlightStyle: (style: TextHighlightStyle) => void;
};

const sanitizePresets = (value: unknown): TextHighlightStyle[] => {
  if (!Array.isArray(value) || value.length !== DEFAULT_TEXT_HIGHLIGHT_PRESETS.length) {
    return DEFAULT_TEXT_HIGHLIGHT_PRESETS.map((preset) => ({ ...preset }));
  }

  return value.map((item, index) => {
    const fallback = DEFAULT_TEXT_HIGHLIGHT_PRESETS[index];
    if (!item || typeof item !== 'object') return { ...fallback };

    const color = 'color' in item && typeof item.color === 'string' ? item.color : '';
    const opacity = 'opacity' in item && typeof item.opacity === 'number' ? item.opacity : NaN;
    const known = getBoardColorOption(color);
    if (!known || !Number.isFinite(opacity)) return { ...fallback };

    return { color: known.name, opacity: clampHighlightOpacity(opacity) };
  });
};

export const useTextHighlightStore = create<TextHighlightState>()(
  persist(
    (set, get) => ({
      presets: DEFAULT_TEXT_HIGHLIGHT_PRESETS.map((preset) => ({ ...preset })),
      activePresetIndex: 0,
      setActivePreset: (index) => {
        if (!get().presets[index]) return;
        set({ activePresetIndex: index });
      },
      setHighlightStyle: (style) => {
        const { presets, activePresetIndex } = get();
        const known = getBoardColorOption(style.color);
        const next: TextHighlightStyle = {
          color: known?.name ?? presets[activePresetIndex]?.color ?? 'yellow',
          opacity: clampHighlightOpacity(style.opacity),
        };
        set({
          presets: presets.map((preset, index) => (index === activePresetIndex ? next : preset)),
        });
      },
    }),
    {
      name: 'board-text-highlight',
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<TextHighlightState>;
        const presets = sanitizePresets(persisted.presets);
        const activePresetIndex =
          typeof persisted.activePresetIndex === 'number' && presets[persisted.activePresetIndex]
            ? persisted.activePresetIndex
            : 0;

        return {
          ...currentState,
          presets,
          activePresetIndex,
        };
      },
    },
  ),
);

export const activeHighlightStyle = (): TextHighlightStyle => {
  const { presets, activePresetIndex } = useTextHighlightStore.getState();
  return presets[activePresetIndex] ?? DEFAULT_TEXT_HIGHLIGHT_PRESETS[0];
};
