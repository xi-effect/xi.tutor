import React, { createContext, useContext, useEffect } from 'react';
import { ModalsContextType, ModalsProviderProps, ModalName } from './types';
import {
  closeModal,
  getModalProps,
  isModalOpen,
  openModal,
  registerModal,
  useModalsStore,
} from './store';
import { getModalFromUrl, updateUrlWithModal } from './utils';

const ModalsContext = createContext<ModalsContextType | undefined>(undefined);

export const ModalsProvider: React.FC<ModalsProviderProps> = ({ children, initialModals = {} }) => {
  // Регистрация начальных модальных окон
  useEffect(() => {
    Object.entries(initialModals).forEach(([name, component]) => {
      registerModal(name as ModalName, component);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Синхронизация с URL при инициализации
  useEffect(() => {
    const modalFromUrl = getModalFromUrl();
    if (modalFromUrl && useModalsStore.getState().modals[modalFromUrl]) {
      openModal(modalFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Синхронизация URL при изменении активной модалки
  useEffect(() => {
    const unsubscribe = useModalsStore.subscribe(
      (state) => state.activeModal,
      (activeModal) => {
        updateUrlWithModal(activeModal);
      },
    );

    return () => unsubscribe();
  }, []);

  const contextValue: ModalsContextType = {
    openModal,
    closeModal,
    registerModal,
    isModalOpen,
    getModalProps,
  };

  const activeModal = useModalsStore((state) => state.activeModal);
  const modals = useModalsStore((state) => state.modals);

  // Рендер активной модалки
  const renderActiveModal = () => {
    if (!activeModal || !modals[activeModal]) return null;

    const { component: ModalComponent, props } = modals[activeModal];
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
