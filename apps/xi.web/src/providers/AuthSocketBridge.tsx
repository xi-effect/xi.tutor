import React from 'react';
import { useAuth } from 'common.auth';
import { SocketProvider } from 'common.sockets';

interface AuthSocketBridgeProps {
  children: React.ReactNode;
}

export const AuthSocketBridge = ({ children }: AuthSocketBridgeProps) => {
  const auth = useAuth();

  return <SocketProvider isAuthenticated={auth.isAuthenticated}>{children}</SocketProvider>;
};
