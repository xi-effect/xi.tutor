import { useCallback, useEffect, useState } from 'react';
import { ensureDemoCabinet, reportStorageLimitReached } from 'common.services';
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

/**
 * Демонстрационный кабинет для гайда репетитора.
 * Создаётся без сообщений в интерфейсе. Идентификаторы нужны турам и шагу занятия.
 */
export const useDemoCabinet = (userId: number, enabled: boolean): DemoCabinetState => {
  const [ids, setIds] = useState<DemoCabinetIds>(emptyDemoCabinetIds);

  const whenReady = useCallback(async () => {
    const next = readIds(await ensureDemoCabinet(userId, demoCabinetPorts()));
    setIds(next);
    return next;
  }, [userId]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    void whenReady()
      .then((next) => {
        if (!cancelled) setIds(next);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error('Не удалось создать демонстрационный кабинет', error);
        reportStorageLimitReached(error);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, whenReady]);

  return { ...ids, whenReady };
};
