import { ModalName } from './types';

export const MODAL_PARAM_NAME = 'modal';

export const getModalFromUrl = (): ModalName | null => {
  if (typeof window === 'undefined') return null;

  const url = new URL(window.location.href);
  return url.searchParams.get(MODAL_PARAM_NAME);
};

export const updateUrlWithModal = (modalName: ModalName | null): void => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);

  if (modalName) {
    url.searchParams.set(MODAL_PARAM_NAME, modalName);
  } else {
    url.searchParams.delete(MODAL_PARAM_NAME);
  }

  window.history.replaceState({}, '', url.toString());
};
