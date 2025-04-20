/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';
import { Router } from '@tanstack/react-router';

export type ModalName = string;

export interface ModalComponent {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

export interface ModalsState {
  modals: Record<ModalName, ModalComponent>;
}

export interface ModalsContextType {
  registerModal: (name: ModalName, component: React.ComponentType<any>) => void;
  navigateToModal: (name: ModalName, props?: Record<string, any>) => void;
  closeModal: () => void;
  getModalProps: (name: ModalName) => Record<string, any> | undefined;
}

export interface ModalsProviderProps {
  children: ReactNode;
  initialModals?: Record<ModalName, React.ComponentType<any>>;
  router: Router<any>;
}

export interface ModalRouteParams {
  modal?: string;
}
