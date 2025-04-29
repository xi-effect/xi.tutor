/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from '@tanstack/react-router';
import { ModalName } from './types';
import { updateModalProps } from './store';

export const MODAL_PARAM_NAME = 'modal';

export const navigateToModal = (
  router: Router<any>,
  name: ModalName,
  props?: Record<string, unknown>,
): void => {
  if (props) {
    updateModalProps(name, props);
  }

  router.navigate({
    // @ts-ignore
    search: (prev) => ({
      ...prev,
      [MODAL_PARAM_NAME]: name,
    }),
  });
};

export const closeModal = (router: Router<any>): void => {
  router.navigate({
    // @ts-ignore
    search: (prev) => {
      const { [MODAL_PARAM_NAME]: _, ...rest } = prev;
      return rest;
    },
  });
};

export const getModalFromSearch = (search: Record<string, string>): ModalName | null => {
  return search[MODAL_PARAM_NAME] || null;
};
