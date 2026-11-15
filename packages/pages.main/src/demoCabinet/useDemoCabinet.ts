import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ensureDemoCabinet,
  reportStorageLimitReached,
  trackFirstStepsDemoCabinet,
} from 'common.services';
import { demoCabinetPorts } from './startDemoCabinet';

export type DemoCabinetIds = {
  classroomId: number | null;
  boardId: string | null;
  noteId: string | null;
};

const emptyDemoCabinetIds = (): DemoCabinetIds => ({
  classroomId: null,
  boardId: null,
  noteId: null,
});

export type DemoCabinetState = DemoCabinetIds & {
  whenReady: () => Promise<DemoCabinetIds>;
};

const readIds = (result: Awaited<ReturnType<typeof ensureDemoCabinet>>): DemoCabinetIds => {
  if (result.status !== 'ready' || result.classroomId == null) return emptyDemoCabinetIds();
  const classroomId = Number(result.classroomId);
  if (!Number.isInteger(classroomId)) return emptyDemoCabinetIds();
  return {
    classroomId,
    boardId: result.boardId,
    noteId: result.noteId,
  };
};

const isClassroomLimit = (error: unknown): boolean =>
  error instanceof Error && error.message === 'classroom-limit';

/**
 * Идентификаторы демонстрационного кабинета для туров.
 * Новый кабинет создаётся только когда create=true: этап training и ни одного кабинета.
 * Иначе запрос лишь дочитывает уже начатый кабинет и не создаёт новый.
 */
export const useDemoCabinet = (
  userId: number,
  enabled: boolean,
  create: boolean,
): DemoCabinetState => {
  const [ids, setIds] = useState<DemoCabinetIds>(emptyDemoCabinetIds);
  const started = useRef(false);
  const mounted = useRef(true);
  const createRef = useRef(create);
  createRef.current = create;

  const load = useCallback(async () => {
    const ports = demoCabinetPorts();
    const result = await ensureDemoCabinet(userId, {
      ...ports,
      canCreateClassroom: () => createRef.current && (ports.canCreateClassroom?.() ?? true),
    });
    const next = readIds(result);
    if (mounted.current) setIds(next);
    return { next, status: result.status };
  }, [userId]);

  const whenReady = useCallback(async () => (await load()).next, [load]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;

    void load()
      .then((result) => {
        if (!mounted.current) return;
        trackFirstStepsDemoCabinet(result.status);
      })
      .catch((error: unknown) => {
        if (!mounted.current) return;
        if (isClassroomLimit(error) && !createRef.current) return;
        trackFirstStepsDemoCabinet('failed');
        console.error('Не удалось создать демонстрационный кабинет', error);
        reportStorageLimitReached(error);
      });
  }, [enabled, load]);

  return { ...ids, whenReady };
};
