import { useEffect } from 'react';
import type { Awareness } from 'y-protocols/awareness';
import type { TLStore, Editor } from 'tldraw';
import { bindPresence } from '../bindings/bind-presence';

/** Подключает presence-курсоры. */
export const useTldrawPresence = (
  store: TLStore,
  editor: Editor,
  awarenessMaybe: Awareness | null,
  username?: string,
) => {
  useEffect(() => {
    if (!awarenessMaybe || typeof awarenessMaybe !== 'object') return; // защита
    return bindPresence(store, editor, awarenessMaybe, username);
  }, [store, editor, awarenessMaybe, username]);
};
