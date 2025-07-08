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
    }),
    { name: 'tldraw-storage' },
  ),
);
