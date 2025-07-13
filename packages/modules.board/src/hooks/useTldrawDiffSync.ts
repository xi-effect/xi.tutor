import { useEffect } from 'react';
import * as Y from 'yjs';
import type { TLStore } from 'tldraw';
import { bindStoreDiff } from '../bindings/bind-store-diff';

export const useTldrawDiffSync = (store: TLStore, doc: Y.Doc) => {
  useEffect(() => bindStoreDiff(store, doc), [store, doc]);
};
