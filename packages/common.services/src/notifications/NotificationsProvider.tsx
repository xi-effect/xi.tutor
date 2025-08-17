import { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from './useNotifications';
import type { NotificationsStateT } from 'common.types';

interface NotificationsContextType extends NotificationsStateT {
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  sendTestNotification: () => void;
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
