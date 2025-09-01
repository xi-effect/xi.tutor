import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ToolType } from '../types';

interface TldrawState {
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
  // Настройки карандаша
  pencilColor: string;
  setPencilColor: (color: string) => void;
  pencilThickness: 's' | 'm' | 'l' | 'xl';
  setPencilThickness: (thickness: 's' | 'm' | 'l' | 'xl') => void;
  pencilOpacity: number;
  setPencilOpacity: (opacity: number) => void;
}

export const useTldrawStore = create<TldrawState>()(
  persist(
    (set) => ({
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
      // Настройки карандаша
      pencilColor: 'black',
      setPencilColor: (color: string) => set(() => ({ pencilColor: color })),
      pencilThickness: 'm',
      setPencilThickness: (thickness: 's' | 'm' | 'l' | 'xl') =>
        set(() => ({ pencilThickness: thickness })),
      pencilOpacity: 100,
      setPencilOpacity: (opacity: number) => set(() => ({ pencilOpacity: opacity })),
      stickerColor: 'grey',
      setStickerColor: (color: string) => set(() => ({ stickerColor: color })),
    }),
    { name: 'tldraw-storage' },
  ),
);
