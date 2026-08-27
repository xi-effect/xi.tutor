import type { Awareness } from 'y-protocols/awareness';
import { useCallback, useEffect, useState } from 'react';
import { useCurrentUser } from 'common.services';
import { useYjsContext } from '../providers/YjsProvider';

/** Не в Y.Doc — только awareness (Hocuspocus не персистит в документ доски) */
export const BOARD_TIMER_AWARENESS_KEY = 'boardTimer' as const;
/** Видимость панели: пишет любой участник, побеждает запись с большим updatedAt */
export const BOARD_TIMER_UI_AWARENESS_KEY = 'boardTimerUi' as const;

export const BOARD_TIMER_DEFAULT_DURATION_MS = 5 * 60 * 1000;
const MAX_DURATION_MS = 99 * 60 * 1000 + 59 * 1000;

export type BoardTimerSnapshot = {
  baseMs: number;
  remainingMs: number;
  isRunning: boolean;
  endsAtMs: number;
};

export type BoardTimerUiSnapshot = {
  isVisible: boolean;
  updatedAt: number;
};

const clampMs = (value: number) => Math.max(0, Math.min(MAX_DURATION_MS, value));

const defaultSnapshot = (): BoardTimerSnapshot => ({
  baseMs: BOARD_TIMER_DEFAULT_DURATION_MS,
  remainingMs: BOARD_TIMER_DEFAULT_DURATION_MS,
  isRunning: false,
  endsAtMs: 0,
});

function normalizeRaw(raw: unknown): BoardTimerSnapshot {
  if (!raw || typeof raw !== 'object') return defaultSnapshot();
  const r = raw as Record<string, unknown>;
  const baseMs = clampMs(Number(r.baseMs ?? BOARD_TIMER_DEFAULT_DURATION_MS));
  const remainingMs = clampMs(Number(r.remainingMs ?? baseMs));
  const isRunning = Boolean(r.isRunning);
  const endsAtMs = Number(r.endsAtMs ?? 0);
  return {
    baseMs,
    remainingMs,
    isRunning,
    endsAtMs: Number.isFinite(endsAtMs) ? endsAtMs : 0,
  };
}

type AwarenessState = {
  [BOARD_TIMER_AWARENESS_KEY]?: BoardTimerSnapshot;
  [BOARD_TIMER_UI_AWARENESS_KEY]?: BoardTimerUiSnapshot;
  presence?: unknown;
};

function normalizeTimerUi(raw: unknown): BoardTimerUiSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const updatedAt = Number(r.updatedAt);
  if (!Number.isFinite(updatedAt)) return null;
  return { isVisible: Boolean(r.isVisible), updatedAt };
}

export function readTimerUiVisible(awareness: Awareness | null | undefined): boolean {
  if (!awareness) return false;

  let latest: BoardTimerUiSnapshot | null = null;
  for (const state of awareness.getStates().values()) {
    const ui = normalizeTimerUi((state as AwarenessState)?.[BOARD_TIMER_UI_AWARENESS_KEY]);
    if (!ui) continue;
    if (!latest || ui.updatedAt >= latest.updatedAt) latest = ui;
  }

  return latest?.isVisible ?? false;
}

function readTimerFromAwareness(
  awareness: Awareness | null | undefined,
  isTutor: boolean,
): BoardTimerSnapshot {
  if (!awareness) return defaultSnapshot();

  const local = awareness.getLocalState() as AwarenessState | null;
  if (isTutor && local?.[BOARD_TIMER_AWARENESS_KEY] != null) {
    return normalizeRaw(local[BOARD_TIMER_AWARENESS_KEY]);
  }

  const states = awareness.getStates();
  for (const state of states.values()) {
    const st = state as AwarenessState;
    if (st?.[BOARD_TIMER_AWARENESS_KEY] != null) {
      return normalizeRaw(st[BOARD_TIMER_AWARENESS_KEY]);
    }
  }

  return defaultSnapshot();
}

/**
 * Таймер доски: синхронизация через Yjs awareness (живёт только в сессии комнаты, не в персисте документа).
 * Время пишет только репетитор; видимость панели может менять любой участник (последняя запись побеждает).
 */
export function useBoardTimer() {
  const { provider } = useYjsContext();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const awareness = provider?.awareness ?? null;

  const [snapshot, setSnapshot] = useState<BoardTimerSnapshot>(() =>
    readTimerFromAwareness(awareness, isTutor),
  );
  const [isVisible, setIsVisible] = useState(() => readTimerUiVisible(awareness));

  const recompute = useCallback(() => {
    setSnapshot(readTimerFromAwareness(awareness, isTutor));
    setIsVisible(readTimerUiVisible(awareness));
  }, [awareness, isTutor]);

  useEffect(() => {
    recompute();
  }, [recompute]);

  useEffect(() => {
    if (!awareness) return;
    const onChange = () => recompute();
    awareness.on('change', onChange);
    return () => awareness.off('change', onChange);
  }, [awareness, recompute]);

  /** Однократная инициализация для репетитора, если в локальном awareness ещё нет таймера */
  useEffect(() => {
    if (!isTutor || !awareness) return;
    const local = awareness.getLocalState() as AwarenessState | null;
    if (local?.[BOARD_TIMER_AWARENESS_KEY] != null) return;
    awareness.setLocalStateField(BOARD_TIMER_AWARENESS_KEY, defaultSnapshot());
  }, [isTutor, awareness]);

  const updateTimer = useCallback(
    (recipe: (prev: BoardTimerSnapshot) => BoardTimerSnapshot) => {
      if (!isTutor || !awareness) return;
      const prev = readTimerFromAwareness(awareness, true);
      const next = recipe(prev);
      awareness.setLocalStateField(BOARD_TIMER_AWARENESS_KEY, {
        baseMs: clampMs(next.baseMs),
        remainingMs: clampMs(next.remainingMs),
        isRunning: Boolean(next.isRunning),
        endsAtMs: Number.isFinite(next.endsAtMs) ? next.endsAtMs : 0,
      });
    },
    [isTutor, awareness],
  );

  const setVisible = useCallback(
    (nextVisible: boolean) => {
      if (!awareness) {
        setIsVisible(nextVisible);
        return;
      }
      awareness.setLocalStateField(BOARD_TIMER_UI_AWARENESS_KEY, {
        isVisible: nextVisible,
        updatedAt: Date.now(),
      });
    },
    [awareness],
  );

  return { snapshot, updateTimer, isVisible, setVisible };
}
