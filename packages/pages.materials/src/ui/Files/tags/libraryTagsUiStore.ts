import { useSyncExternalStore } from 'react';

let manageOpen = false;
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeLibraryTagsManage = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getLibraryTagsManageOpen = (): boolean => manageOpen;

export const setLibraryTagsManageOpen = (open: boolean): void => {
  if (manageOpen === open) {
    return;
  }

  manageOpen = open;
  emit();
};

export const openLibraryTagsManage = (): void => {
  setLibraryTagsManageOpen(true);
};

export const useLibraryTagsManage = () => {
  const isOpen = useSyncExternalStore(
    subscribeLibraryTagsManage,
    getLibraryTagsManageOpen,
    () => false,
  );

  return {
    manageOpen: isOpen,
    openManage: openLibraryTagsManage,
    setManageOpen: setLibraryTagsManageOpen,
  };
};
