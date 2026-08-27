import { create } from 'zustand';

type ActivityEditState = {
  editingIds: Record<string, boolean>;
  setEditing: (shapeId: string, editing: boolean) => void;
  toggleEditing: (shapeId: string) => void;
  isEditing: (shapeId: string) => boolean;
};

export const useActivityEditStore = create<ActivityEditState>((set, get) => ({
  editingIds: {},
  setEditing: (shapeId, editing) =>
    set((state) => ({
      editingIds: { ...state.editingIds, [shapeId]: editing },
    })),
  toggleEditing: (shapeId) =>
    set((state) => ({
      editingIds: { ...state.editingIds, [shapeId]: !state.editingIds[shapeId] },
    })),
  isEditing: (shapeId) => Boolean(get().editingIds[shapeId]),
}));
