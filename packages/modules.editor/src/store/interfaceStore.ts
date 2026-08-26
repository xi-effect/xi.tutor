import { create } from 'zustand';

export type EditorModalT =
  'uploadImage' | 'uploadAudio' | 'uploadPdf' | 'uploadPresentation' | null;

type useInterfaceStoreT = {
  activeCellControls: string | null;
  isAddNewNode: string | null;
  setActiveCellControls: (newValue: string | null) => void;
  setIsAddNewNode: (newValue: string | null) => void;
  activeModal: EditorModalT;
  openModal: (modal: Exclude<EditorModalT, null>) => void;
  closeModal: () => void;
  isBlockMenuOpen: boolean;
  setBlockMenuOpen: (open: boolean) => void;
};

export const useInterfaceStore = create<useInterfaceStoreT>()((set) => ({
  activeCellControls: null,
  isAddNewNode: null,
  setActiveCellControls: (newValue) => set({ activeCellControls: newValue }),
  setIsAddNewNode: (newValue) => set({ isAddNewNode: newValue }),
  activeModal: null,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  isBlockMenuOpen: false,
  setBlockMenuOpen: (open) => set({ isBlockMenuOpen: open }),
}));
