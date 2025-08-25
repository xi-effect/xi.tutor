import { useCallback, useRef } from 'react';

interface NetworkControlOptions {
  suppressNotifications?: boolean;
  suppressOnAuthErrors?: boolean;
  suppressOnAppExit?: boolean;
}

export const useNetworkControl = (options: NetworkControlOptions = {}) => {
  const {
    suppressNotifications = false,
    suppressOnAuthErrors = true,
    suppressOnAppExit = true,
  } = options;

  const isSuppressed = useRef(false);
  const authErrorDetected = useRef(false);
  const appExiting = useRef(false);

  const suppressNetworkNotifications = useCallback(() => {
    isSuppressed.current = true;
  }, []);

  const enableNetworkNotifications = useCallback(() => {
    isSuppressed.current = false;
  }, []);

  const setAuthErrorDetected = useCallback((detected: boolean) => {
    authErrorDetected.current = detected;
  }, []);

  const setAppExiting = useCallback((exiting: boolean) => {
    appExiting.current = exiting;
  }, []);

  const shouldShowNotification = useCallback(() => {
    if (suppressNotifications || isSuppressed.current) {
      return false;
    }

    if (suppressOnAuthErrors && authErrorDetected.current) {
      return false;
    }

    if (suppressOnAppExit && appExiting.current) {
      return false;
    }

    return true;
  }, [suppressNotifications, suppressOnAuthErrors, suppressOnAppExit]);

  return {
    suppressNetworkNotifications,
    enableNetworkNotifications,
    setAuthErrorDetected,
    setAppExiting,
    shouldShowNotification,
    isSuppressed: isSuppressed.current,
    authErrorDetected: authErrorDetected.current,
    appExiting: appExiting.current,
  };
};
