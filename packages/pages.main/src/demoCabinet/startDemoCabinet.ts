import {
  ensureDemoCabinet,
  reportStorageLimitReached,
  type DemoCabinetPorts,
} from 'common.services';
import { tryStartClassroomCreate } from 'common.subscription';

export const demoCabinetPorts = (): Pick<
  DemoCabinetPorts,
  'canCreateClassroom' | 'seedBoard' | 'seedNote'
> => ({
  canCreateClassroom: () => tryStartClassroomCreate(),
  seedBoard: async (target) => {
    const { seedDemoBoard } = await import('modules.board/demo');
    await seedDemoBoard(target);
  },
  seedNote: async (target) => {
    const { seedDemoNote } = await import('modules.editor/demo');
    await seedDemoNote(target);
  },
});

/** Запускает создание кабинета и его содержимого, не блокируя экран. Повтор безопасен. */
export const startDemoCabinet = (userId: number): void => {
  void ensureDemoCabinet(userId, demoCabinetPorts()).catch((error: unknown) => {
    console.error('Не удалось создать демонстрационный кабинет', error);
    reportStorageLimitReached(error);
  });
};
