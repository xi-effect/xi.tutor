import React, { useEffect } from 'react';
import { NetworkProvider as NetworkContextProvider } from 'common.utils';
import { useNetworkControl } from './useNetworkControl';

interface NetworkProviderProps {
  children: React.ReactNode;
  suppressNotifications?: boolean;
}

const NetworkProviderContent: React.FC<{
  children: React.ReactNode;
  suppressNotifications?: boolean;
}> = ({ children, suppressNotifications = false }) => {
  const { setAppExiting } = useNetworkControl({
    suppressNotifications,
    suppressOnAuthErrors: true,
    suppressOnAppExit: true,
  });

  // Обрабатываем события выхода из приложения
  useEffect(() => {
    const handleBeforeUnload = () => {
      setAppExiting(true);
    };

    const handlePageHide = () => {
      setAppExiting(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setAppExiting(true);
      } else {
        setAppExiting(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setAppExiting]);

  return <>{children}</>;
};

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
  suppressNotifications = false,
}) => {
  const { shouldShowNotification } = useNetworkControl({
    suppressNotifications,
    suppressOnAuthErrors: true,
    suppressOnAppExit: true,
  });

  return (
    <NetworkContextProvider shouldShowNotification={shouldShowNotification}>
      <NetworkProviderContent suppressNotifications={suppressNotifications}>
        {children}
      </NetworkProviderContent>
    </NetworkContextProvider>
  );
};
