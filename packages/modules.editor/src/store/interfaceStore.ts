import { create } from 'zustand';

type useInterfaceStoreT = {
  activeCellControls: string | null;
  isAddNewNode: string | null;
  setActiveCellControls: (newValue: string | null) => void;
  setIsAddNewNode: (newValue: string | null) => void;
  activeModal: 'uploadImage' | null;
  openModal: (modal: 'uploadImage') => void;
  closeModal: () => void;
};

export const useInterfaceStore = create<useInterfaceStoreT>()((set) => ({
  activeCellControls: null,
  isAddNewNode: null,
  setActiveCellControls: (newValue) => set({ activeCellControls: newValue }),
  setIsAddNewNode: (newValue) => set({ isAddNewNode: newValue }),
  activeModal: null,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}));
