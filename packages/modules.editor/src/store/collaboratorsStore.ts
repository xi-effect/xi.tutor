import { create } from 'zustand';
import type { TCollaborator } from '../types';

type TCollaboratorsStore = {
  collaborators: TCollaborator[];
  setCollaborators: (collaborators: TCollaborator[]) => void;
  setCollaboratorsIfChanged: (collaborators: TCollaborator[]) => void;
  reset: () => void;
};

export const useCollaboratorsStore = create<TCollaboratorsStore>()((set, get) => ({
  collaborators: [],
  setCollaborators: (collaborators) => set({ collaborators }),
  setCollaboratorsIfChanged: (collaborators) => {
    const s = get();
    if (JSON.stringify(s.collaborators) !== JSON.stringify(collaborators)) {
      set({ collaborators });
    }
  },
  reset: () => set({ collaborators: [] }),
}));
