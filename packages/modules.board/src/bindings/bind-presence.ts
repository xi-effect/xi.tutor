/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TLStore } from 'tldraw';
import type { TLInstancePresence, TLInstancePresenceID } from '@tldraw/tlschema';
import type { Awareness } from 'y-protocols/awareness';
import type { Editor } from 'tldraw';
import { nanoid } from 'nanoid';
import { throttleRAF } from '../utils/throttleRAF';

const palette = [
  '#EF4444',
  '#F97316',
  '#FACC15',
  '#4ADE80',
  '#22D3EE',
  '#3B82F6',
  '#6366F1',
  '#A855F7',
  '#EC4899',
  '#F43F5E',
  '#14B8A6',
  '#10B981',
  '#84CC16',
  '#EAB308',
  '#F59E0B',
  '#FB923C',
];

/* ------------------- helpers для разных версий awareness ------------------- */
const hasField = (
  aw: Awareness,
): aw is Awareness & {
  setLocalStateField: (k: string, v: unknown) => void;
  getLocalState: () => any;
} => typeof (aw as any).setLocalStateField === 'function';

const getLocal = (aw: Awareness) =>
  hasField(aw) ? aw.getLocalState() : ((aw as any).localState ?? null);

const mergeLocal = (aw: Awareness, patch: Record<string, unknown>) => {
  if (hasField(aw)) {
    Object.entries(patch).forEach(([k, v]) => aw.setLocalStateField(k, v));
  } else {
    const current = (aw as any).localState;
    const base = current && typeof current === 'object' && !Array.isArray(current) ? current : {};
    (aw as any).localState = { ...base, ...patch };
  }
};
/* -------------------------------------------------------------------------- */

export function bindPresence(
  store: TLStore,
  editor: Editor,
  awareness: Awareness,
  username?: string,
) {
  const userId = nanoid(6);
  const color = palette[awareness.clientID % palette.length];

  mergeLocal(awareness, {
    presence: {
      userId,
      name: username ?? `User-${userId}`,
      color,
      pageCursor: null,
      selectedShapeIds: [] as string[],
    },
  });

  /* курсор */
  const onPointerMove = throttleRAF((e: PointerEvent) => {
    const pagePt = editor.screenToPage({ x: e.clientX, y: e.clientY });
    const p = getLocal(awareness)?.presence;
    if (p) mergeLocal(awareness, { presence: { ...p, pageCursor: pagePt } });
  });
  window.addEventListener('pointermove', onPointerMove);

  /* выделение */
  const handleSelection = () => {
    const ids = editor.getSelectedShapeIds();
    const p = getLocal(awareness)?.presence;
    if (p) mergeLocal(awareness, { presence: { ...p, selectedShapeIds: ids } });
  };
  editor.on('change', handleSelection);

  /* remote presence + cleanup */
  const applyRemote = () => {
    const incoming: Record<string, TLInstancePresence> = {};

    awareness.getStates().forEach((s) => {
      const p = (s as any).presence;
      if (!p) return;
      incoming[`presence:${p.userId}`] = {
        id: `presence:${p.userId}` as TLInstancePresenceID,
        typeName: 'instance_presence',
        userId: p.userId,
        userName: p.name,
        color: p.color,
        selectedShapeIds: p.selectedShapeIds,
        cursor: p.pageCursor ? { ...p.pageCursor, rotation: 0, type: 'default' } : null,
        lastActivityTimestamp: Date.now(),
        currentPageId: 'page:page1' as any,
        brush: null,
        camera: null,
        chatMessage: '',
        followingUserId: null,
        meta: {},
        screenBounds: null,
        scribbles: [],
      };
    });

    store.mergeRemoteChanges(() => {
      Object.values(incoming).forEach((r) => store.put([r]));
      store.allRecords().forEach((rec) => {
        if (rec.typeName !== 'instance_presence') return;
        if (!(rec.id in incoming)) store.remove([rec.id]);
      });
    });
  };
  awareness.on('change', applyRemote);

  return () => {
    window.removeEventListener('pointermove', onPointerMove);
    editor.off('change', handleSelection as any);
    awareness.off('change', applyRemote);
  };
}
