import { create } from 'zustand';
import type { ActiveBlockT } from '../types';

export type EditorModalT = 'insertImageLink' | null;

type useInterfaceStoreT = {
  activeCellControls: string | null;
  isAddNewNode: string | null;
  setActiveCellControls: (newValue: string | null) => void;
  setIsAddNewNode: (newValue: string | null) => void;
  activeModal: EditorModalT;
  openModal: (modal: Exclude<EditorModalT, null>) => void;
  closeModal: () => void;
  cloudPickerOpen: boolean;
  insertAnchor: ActiveBlockT | undefined;
  openCloudPicker: (anchor?: ActiveBlockT) => void;
  closeCloudPicker: () => void;
};

export const useInterfaceStore = create<useInterfaceStoreT>()((set) => ({
  activeCellControls: null,
  isAddNewNode: null,
  setActiveCellControls: (newValue) => set({ activeCellControls: newValue }),
  setIsAddNewNode: (newValue) => set({ isAddNewNode: newValue }),
  activeModal: null,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  cloudPickerOpen: false,
  insertAnchor: undefined,
  openCloudPicker: (anchor) => set({ cloudPickerOpen: true, insertAnchor: anchor }),
  closeCloudPicker: () => set({ cloudPickerOpen: false, insertAnchor: undefined }),
}));
