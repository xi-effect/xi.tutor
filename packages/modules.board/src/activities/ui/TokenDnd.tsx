/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export const ACTIVITY_TOKEN_MIME = 'text/x-sovlium-token';

type TokenDndContextValue = {
  pickedId: string | null;
  pick: (id: string | null) => void;
};

const TokenDndContext = createContext<TokenDndContextValue | null>(null);

export function TokenDndProvider({ children }: { children: ReactNode }) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const value = useMemo(
    () => ({
      pickedId,
      pick: (id: string | null) => setPickedId((current) => (current === id ? null : id)),
    }),
    [pickedId],
  );
  return <TokenDndContext.Provider value={value}>{children}</TokenDndContext.Provider>;
}

export function useTokenDnd() {
  const value = useContext(TokenDndContext);
  if (!value) {
    return {
      pickedId: null,
      pick: (id: string | null) => {
        void id;
      },
    };
  }
  return value;
}
