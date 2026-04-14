import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ToolType } from '../types';

export type InputMode = 'auto' | 'pen' | 'mouse';
export type PenThickness = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface PenPreset {
  color: string;
  thickness: PenThickness;
  opacity: number;
}

const DEFAULT_PEN_PRESETS: PenPreset[] = [
  { color: 'black', thickness: 'm', opacity: 100 },
  { color: 'blue', thickness: 's', opacity: 100 },
  { color: 'red', thickness: 'l', opacity: 50 },
];

interface TldrawState {
  /** Режим ввода: авто (по устройству), перо, мышь */
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  /** Показывать всплывашку с дебаг-инфой (кол-во элементов на доске) */
  showDebugInfo: boolean;
  setShowDebugInfo: (show: boolean) => void;
  selectedTool: ToolType;
  setSelectedTool: (tool: ToolType) => void;
  selectedElementId: string | null;
  selectElement: (id: string | null) => void;
  isElementTransforming: boolean;
  setIsElementTransforming: (value: boolean) => void;
  selectToolbarPosition: { x: number; y: number };
  setSelectToolbarPosition: (position: { x: number; y: number }) => void;
  isEditingText?: boolean;
  setIsEditingText: (value: boolean) => void;
  editingElementId: string | null;
  setEditingElementId: (id: string | null) => void;
  stickerColor: string;
  setStickerColor: (color: string) => void;
  arrowColor: string;
  setArrowColor: (color: string) => void;
  // Пресеты карандаша
  penPresets: PenPreset[];
  activePresetIndex: number;
  setActivePreset: (index: number) => void;
  updateActivePreset: (patch: Partial<PenPreset>) => void;
  // Вычисляемые из активного пресета (обратная совместимость)
  pencilColor: string;
  setPencilColor: (color: string) => void;
  pencilThickness: PenThickness;
  setPencilThickness: (thickness: PenThickness) => void;
  pencilOpacity: number;
  setPencilOpacity: (opacity: number) => void;
}

export const useTldrawStore = create<TldrawState>()(
  persist(
    (set, get) => ({
      inputMode: 'auto',
      setInputMode: (mode: InputMode) => set(() => ({ inputMode: mode })),
      showDebugInfo: false,
      setShowDebugInfo: (show) => set(() => ({ showDebugInfo: show })),
      selectedTool: 'select',
      setSelectedTool: (tool: ToolType) => set(() => ({ selectedTool: tool })),
      selectedElementId: null,
      selectElement: (id: string | null) => set(() => ({ selectedElementId: id })),
      isElementTransforming: false,
      setIsElementTransforming: (value) => {
        set(() => ({ isElementTransforming: value }));
      },
      selectToolbarPosition: { x: 0, y: 0 },
      setSelectToolbarPosition: (position: { x: number; y: number }) => {
        set(() => ({ selectToolbarPosition: position }));
      },
      isEditingText: false,
      setIsEditingText: (value) => {
        set(() => ({ isEditingText: value }));
      },
      editingElementId: null,
      setEditingElementId: (id: string | null) => set(() => ({ editingElementId: id })),

      penPresets: DEFAULT_PEN_PRESETS,
      activePresetIndex: 0,

      setActivePreset: (index: number) => {
        const { penPresets } = get();
        const preset = penPresets[index];
        if (!preset) return;
        set({
          activePresetIndex: index,
          pencilColor: preset.color,
          pencilThickness: preset.thickness,
          pencilOpacity: preset.opacity,
        });
      },

      updateActivePreset: (patch: Partial<PenPreset>) => {
        const { penPresets, activePresetIndex } = get();
        const updated = penPresets.map((p, i) =>
          i === activePresetIndex ? { ...p, ...patch } : p,
        );
        set({ penPresets: updated });
      },

      pencilColor: DEFAULT_PEN_PRESETS[0].color,
      setPencilColor: (color: string) => {
        const { activePresetIndex, penPresets } = get();
        const updated = penPresets.map((p, i) => (i === activePresetIndex ? { ...p, color } : p));
        set({ pencilColor: color, penPresets: updated });
      },

      pencilThickness: DEFAULT_PEN_PRESETS[0].thickness,
      setPencilThickness: (thickness: PenThickness) => {
        const { activePresetIndex, penPresets } = get();
        const updated = penPresets.map((p, i) =>
          i === activePresetIndex ? { ...p, thickness } : p,
        );
        set({ pencilThickness: thickness, penPresets: updated });
      },

      pencilOpacity: DEFAULT_PEN_PRESETS[0].opacity,
      setPencilOpacity: (opacity: number) => {
        const { activePresetIndex, penPresets } = get();
        const updated = penPresets.map((p, i) => (i === activePresetIndex ? { ...p, opacity } : p));
        set({ pencilOpacity: opacity, penPresets: updated });
      },

      stickerColor: 'grey',
      setStickerColor: (color: string) => set(() => ({ stickerColor: color })),
      arrowColor: 'black',
      setArrowColor: (color: string) => set(() => ({ arrowColor: color })),
    }),
    { name: 'tldraw-storage' },
  ),
);
