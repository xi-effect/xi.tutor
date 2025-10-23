import { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from './useNotifications';
import type { NotificationsStateT } from 'common.types';

interface NotificationsContextType extends NotificationsStateT {
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendTestNotification: () => void;
  loadMore: () => void;
  refreshNotifications: () => void;
  refreshCount: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
  const notificationsData = useNotifications();

  return (
    <NotificationsContext.Provider value={notificationsData}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);

  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }

  return context;
};
