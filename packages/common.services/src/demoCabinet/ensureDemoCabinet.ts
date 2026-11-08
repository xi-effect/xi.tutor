import { ClassroomMaterialsQueryKey, ClassroomsQueryKey } from 'common.api';
import { queryClient } from 'common.config';
import { isAxiosError } from 'axios';
import { invalidateClassroomCounts } from '../classrooms/useClassroomCounts';
import { getCurrentUserFlag } from '../userFlags/getCurrentUserFlag';
import { updateCurrentUserFlag } from '../userFlags/updateCurrentUserFlag';
import {
  createDemoBoard,
  createDemoGroupClassroom,
  createDemoNote,
  demoClassroomExists,
  demoMaterialExists,
} from './api';
import { DemoCabinetError } from './errors';
import {
  browserDemoCabinetStorage,
  emptyDemoCabinetProgress,
  readDemoCabinetProgress,
  writeDemoCabinetProgress,
} from './progress';
import { DEMO_CABINET_FLAG_KEY } from './template';
import type {
  DemoCabinetPorts,
  DemoCabinetProgress,
  DemoCabinetResult,
  DemoCabinetStorage,
} from './types';

const flights = new Map<number, Promise<DemoCabinetResult>>();

export const resetDemoCabinetInflightForTests = (): void => {
  flights.clear();
};

const readInitializedFlag = async (): Promise<boolean> => {
  try {
    return await getCurrentUserFlag(DEMO_CABINET_FLAG_KEY);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return false;
    throw error;
  }
};

const markInitializedFlag = async (): Promise<void> => {
  await updateCurrentUserFlag(DEMO_CABINET_FLAG_KEY, true);
};

const refreshDemoCabinetQueries = (classroomId: string): void => {
  void queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] });
  void invalidateClassroomCounts(queryClient);
  void queryClient.invalidateQueries({
    queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterials, classroomId],
  });
};

const lockDemoCabinet = <T>(userId: number, run: () => Promise<T>): Promise<T> => {
  const request = globalThis.navigator?.locks?.request?.bind(globalThis.navigator.locks);
  if (!request) return run();
  return request(`sovlium-demo-cabinet-${userId}`, run);
};

const readyFrom = (progress: DemoCabinetProgress | null): DemoCabinetResult => ({
  status: 'ready',
  classroomId: progress?.phase === 'ready' ? progress.classroomId : null,
  boardId: progress?.phase === 'ready' ? progress.boardId : null,
  noteId: progress?.phase === 'ready' ? progress.noteId : null,
});

type ResolvedPorts = Required<Omit<DemoCabinetPorts, 'storage'>> & {
  storage: DemoCabinetStorage;
};

const resolvePorts = (ports: DemoCabinetPorts): ResolvedPorts => ({
  storage: ports.storage ?? browserDemoCabinetStorage(),
  readInitialized: ports.readInitialized ?? readInitializedFlag,
  markInitialized: ports.markInitialized ?? markInitializedFlag,
  classroomExists: ports.classroomExists ?? demoClassroomExists,
  materialExists: ports.materialExists ?? demoMaterialExists,
  createClassroom: ports.createClassroom ?? createDemoGroupClassroom,
  createBoard: ports.createBoard ?? createDemoBoard,
  createNote: ports.createNote ?? createDemoNote,
  seedBoard: ports.seedBoard,
  seedNote: ports.seedNote,
  canCreateClassroom: ports.canCreateClassroom ?? (() => true),
  refresh: ports.refresh ?? refreshDemoCabinetQueries,
});

const persist = (storage: DemoCabinetStorage, userId: number, progress: DemoCabinetProgress) => {
  writeDemoCabinetProgress(storage, userId, progress);
};

const executeDemoCabinet = async (
  userId: number,
  ports: ResolvedPorts,
): Promise<DemoCabinetResult> => {
  const stored = readDemoCabinetProgress(ports.storage, userId);
  const initialized = await ports.readInitialized();

  if (initialized) {
    if (stored?.phase === 'removed') return { status: 'removed' };
    return readyFrom(stored);
  }

  if (stored?.phase === 'removed') {
    await ports.markInitialized();
    return { status: 'removed' };
  }

  if (stored?.phase === 'ready') {
    await ports.markInitialized();
    return readyFrom(stored);
  }

  let current = stored?.phase === 'in_progress' ? stored : emptyDemoCabinetProgress();

  if (!current.classroomId) {
    if (!ports.canCreateClassroom()) {
      throw new DemoCabinetError('classroom-limit');
    }
    const classroomId = await ports.createClassroom();
    current = { ...current, phase: 'in_progress', classroomId };
    persist(ports.storage, userId, current);
    ports.refresh(classroomId);
  } else {
    const exists = await ports.classroomExists(current.classroomId);
    if (!exists) {
      current = {
        ...current,
        phase: 'removed',
        boardId: null,
        noteId: null,
        boardSettled: true,
        noteSettled: true,
      };
      persist(ports.storage, userId, current);
      await ports.markInitialized();
      return { status: 'removed' };
    }
  }

  const classroomId = current.classroomId;
  if (!classroomId) throw new DemoCabinetError('missing-classroom');

  let boardCreatedNow = false;
  if (!current.boardSettled && !current.boardId) {
    current = { ...current, boardId: await ports.createBoard(classroomId) };
    boardCreatedNow = true;
    persist(ports.storage, userId, current);
  }

  let noteCreatedNow = false;
  if (!current.noteSettled && !current.noteId) {
    current = { ...current, noteId: await ports.createNote(classroomId) };
    noteCreatedNow = true;
    persist(ports.storage, userId, current);
  }

  if (!current.boardSettled && current.boardId) {
    const boardId = current.boardId;
    if (!boardCreatedNow) {
      const exists = await ports.materialExists(classroomId, boardId);
      if (!exists) {
        current = { ...current, boardId: null, boardSettled: true };
        persist(ports.storage, userId, current);
      }
    }
    if (current.boardId) {
      await ports.seedBoard({ classroomId, boardId: current.boardId });
      current = { ...current, boardSettled: true };
      persist(ports.storage, userId, current);
    }
  }

  if (!current.noteSettled && current.noteId) {
    const noteId = current.noteId;
    if (!noteCreatedNow) {
      const exists = await ports.materialExists(classroomId, noteId);
      if (!exists) {
        current = { ...current, noteId: null, noteSettled: true };
        persist(ports.storage, userId, current);
      }
    }
    if (current.noteId) {
      await ports.seedNote({
        classroomId,
        noteId: current.noteId,
        boardId: current.boardId,
      });
      current = { ...current, noteSettled: true };
      persist(ports.storage, userId, current);
    }
  }

  current = { ...current, phase: 'ready' };
  persist(ports.storage, userId, current);
  ports.refresh(classroomId);
  await ports.markInitialized();

  return {
    status: 'ready',
    classroomId,
    boardId: current.boardId,
    noteId: current.noteId,
  };
};

/**
 * Создаёт демонстрационный кабинет один раз на пользователя.
 * Повторный и параллельный вызов не создаёт дубликаты.
 * Серверный флаг закрывает повтор после успеха и после удаления кабинета.
 * Локальный прогресс хранит идентификаторы и позволяет досоздать недостающий шаг.
 */
export const ensureDemoCabinet = (
  userId: number,
  ports: DemoCabinetPorts,
): Promise<DemoCabinetResult> => {
  const current = flights.get(userId);
  if (current) return current;

  const job = lockDemoCabinet(userId, () => executeDemoCabinet(userId, resolvePorts(ports)));
  flights.set(userId, job);
  void job
    .finally(() => {
      if (flights.get(userId) === job) flights.delete(userId);
    })
    .catch(() => undefined);
  return job;
};
