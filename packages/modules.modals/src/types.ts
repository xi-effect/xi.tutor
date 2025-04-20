/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';

export type ModalName = string;

export interface ModalComponent {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

export interface ModalsState {
  activeModal: ModalName | null;
  modals: Record<ModalName, ModalComponent>;
}

export interface ModalsContextType {
  openModal: (name: ModalName, props?: Record<string, any>) => void;
  closeModal: () => void;
  registerModal: (name: ModalName, component: React.ComponentType<any>) => void;
  isModalOpen: (name: ModalName) => boolean;
  getModalProps: (name: ModalName) => Record<string, any> | undefined;
}

export interface ModalsProviderProps {
  children: ReactNode;
  initialModals?: Record<ModalName, React.ComponentType<any>>;
}
