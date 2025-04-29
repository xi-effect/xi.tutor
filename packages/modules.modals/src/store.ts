/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { ModalName, ModalsState } from './types';

export const useModalsStore = create<ModalsState>(() => ({
  modals: {},
}));

export const registerModal = (name: ModalName, component: React.ComponentType<any>) => {
  useModalsStore.setState((state) => ({
    modals: {
      ...state.modals,
      [name]: {
        component,
        props: state.modals[name]?.props || {},
      },
    },
  }));
};

export const updateModalProps = (name: ModalName, props?: Record<string, any>) => {
  useModalsStore.setState((state) => ({
    modals: {
      ...state.modals,
      [name]: {
        ...state.modals[name],
        props,
      },
    },
  }));
};

export const getModalProps = (name: ModalName): Record<string, any> | undefined => {
  return useModalsStore.getState().modals[name]?.props;
};

export const getModalComponent = (name: ModalName): React.ComponentType<any> | undefined => {
  return useModalsStore.getState().modals[name]?.component;
};
