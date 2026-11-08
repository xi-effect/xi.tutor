import { DEMO_CABINET_TEMPLATE_VERSION } from './template';
import type { DemoCabinetPhase, DemoCabinetProgress, DemoCabinetStorage } from './types';

const STORAGE_PREFIX = 'sovlium.demoCabinet.v1.';

export const demoCabinetStorageKey = (userId: number): string => `${STORAGE_PREFIX}${userId}`;

export const emptyDemoCabinetProgress = (): DemoCabinetProgress => ({
  templateVersion: DEMO_CABINET_TEMPLATE_VERSION,
  phase: 'in_progress',
  classroomId: null,
  boardId: null,
  noteId: null,
  boardSettled: false,
  noteSettled: false,
});

const isPhase = (value: unknown): value is DemoCabinetPhase =>
  value === 'in_progress' || value === 'ready' || value === 'removed';

const readId = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value : null;

export const readDemoCabinetProgress = (
  storage: DemoCabinetStorage,
  userId: number,
): DemoCabinetProgress | null => {
  const raw = storage.getItem(demoCabinetStorageKey(userId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DemoCabinetProgress> | null;
    if (!parsed || typeof parsed !== 'object' || !isPhase(parsed.phase)) return null;
    if (typeof parsed.boardSettled !== 'boolean' || typeof parsed.noteSettled !== 'boolean') {
      return null;
    }

    return {
      templateVersion: DEMO_CABINET_TEMPLATE_VERSION,
      phase: parsed.phase,
      classroomId: readId(parsed.classroomId),
      boardId: readId(parsed.boardId),
      noteId: readId(parsed.noteId),
      boardSettled: parsed.boardSettled,
      noteSettled: parsed.noteSettled,
    };
  } catch {
    return null;
  }
};

export const writeDemoCabinetProgress = (
  storage: DemoCabinetStorage,
  userId: number,
  progress: DemoCabinetProgress,
): void => {
  storage.setItem(
    demoCabinetStorageKey(userId),
    JSON.stringify({
      ...progress,
      templateVersion: DEMO_CABINET_TEMPLATE_VERSION,
    }),
  );
};

export const browserDemoCabinetStorage = (): DemoCabinetStorage => localStorage;
