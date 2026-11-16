import { updateCurrentUserFlag } from '../userFlags/updateCurrentUserFlag';
import { firstStepFlagKey } from './model';
import { clearFirstStepDone, readFirstStepMarks, type FirstStepsStorage } from './storage';

const resetByUser = new Map<number, Promise<void>>();

const inviteTourMarkKey = (userId: number) => `sovlium.firstSteps.inviteMarkedByTour.${userId}`;

/**
 * До появления тура приглашение могло отметиться само. Первый заход браузера
 * это стирает и не подхватывает старый флаг `fs.tutor.invite.done`.
 * `false` — в этом заходе флаг приглашения игнорировать.
 */
export const resolveInviteDoneImport = async (
  storage: FirstStepsStorage,
  userId: number,
  role: 'tutor' | 'student',
): Promise<boolean> => {
  if (role !== 'tutor' || typeof window === 'undefined') return true;

  const pending = resetByUser.get(userId);
  if (pending) {
    await pending;
    return false;
  }

  let alreadyCutOver = false;
  try {
    alreadyCutOver = window.localStorage.getItem(inviteTourMarkKey(userId)) === '1';
  } catch {
    return true;
  }

  if (alreadyCutOver) return true;

  try {
    window.localStorage.setItem(inviteTourMarkKey(userId), '1');
  } catch {
    return true;
  }

  if (readFirstStepMarks(storage, userId, role).invite === 'done') {
    clearFirstStepDone(storage, userId, role, 'invite');
  }

  const reset = updateCurrentUserFlag(firstStepFlagKey('tutor', 'invite', 'done'), false)
    .then(() => undefined)
    .catch((error: unknown) => {
      console.error('Не удалось сбросить устаревшую отметку приглашения', error);
    });
  resetByUser.set(userId, reset);
  await reset;
  return false;
};

export const resetInviteDoneImportForTests = (): void => {
  resetByUser.clear();
};
