/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { ModalName, ModalsState } from './types';

export const useModalsStore = create<ModalsState>(() => ({
  activeModal: null,
  modals: {},
}));

export const openModal = (name: ModalName, props?: Record<string, any>) => {
  useModalsStore.setState((state) => ({
    activeModal: name,
    modals: {
      ...state.modals,
      [name]: {
        ...state.modals[name],
        props,
      },
    },
  }));
};

export const closeModal = () => {
  useModalsStore.setState({
    activeModal: null,
  });
};

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

export const isModalOpen = (name: ModalName): boolean => {
  return useModalsStore.getState().activeModal === name;
};

export const getModalProps = (name: ModalName): Record<string, any> | undefined => {
  return useModalsStore.getState().modals[name]?.props;
};
