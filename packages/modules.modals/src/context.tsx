/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { createContext, useContext, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import { ModalsContextType, ModalsProviderProps, ModalName } from './types';
import { registerModal as registerModalToStore, getModalProps, getModalComponent } from './store';
import {
  navigateToModal as navigateToModalUtil,
  closeModal as closeModalUtil,
  getModalFromSearch,
} from './utils';

const ModalsContext = createContext<ModalsContextType | undefined>(undefined);

export const ModalsProvider: React.FC<ModalsProviderProps> = ({
  children,
  initialModals = {},
  router,
}) => {
  // @ts-ignore
  const search = useSearch() as Record<string, string>;
  const activeModal = getModalFromSearch(search);

  // Регистрация начальных модальных окон
  useEffect(() => {
    Object.entries(initialModals).forEach(([name, component]) => {
      registerModalToStore(name as ModalName, component);
    });
  }, [initialModals]);

  const navigateToModal = (name: ModalName, props?: Record<string, any>) => {
    navigateToModalUtil(router, name, props);
  };

  const closeModal = () => {
    closeModalUtil(router);
  };

  const registerModal = (name: ModalName, component: React.ComponentType<any>) => {
    registerModalToStore(name, component);
  };

  const contextValue: ModalsContextType = {
    navigateToModal,
    closeModal,
    registerModal,
    getModalProps,
  };

  // Рендер активной модалки
  const renderActiveModal = () => {
    if (!activeModal) return null;

    const ModalComponent = getModalComponent(activeModal);
    if (!ModalComponent) return null;

    const props = getModalProps(activeModal);
    return <ModalComponent {...props} />;
  };

  return (
    <ModalsContext.Provider value={contextValue}>
      {children}
      {renderActiveModal()}
    </ModalsContext.Provider>
  );
};

export const useModals = (): ModalsContextType => {
  const context = useContext(ModalsContext);

  if (context === undefined) {
    throw new Error('useModals must be used within a ModalsProvider');
  }

  return context;
};
