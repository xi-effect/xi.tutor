import * as React from 'react';
import { AuthContext } from './context';

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const key = 'tanstack.auth.user';

function getStoredUser() {
  return localStorage.getItem(key);
}

function setStoredUser(user: string | null) {
  if (user) {
    localStorage.setItem(key, user);
  } else {
    localStorage.removeItem(key);
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<string | null>(getStoredUser());
  const isAuthenticated = !!user;

  const logout = React.useCallback(async () => {
    await sleep(250);

    setStoredUser(null);
    setUser(null);
  }, []);

  const login = React.useCallback(async (username: string) => {
    await sleep(500);

    setStoredUser(username);
    setUser(username);
  }, []);

  React.useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
