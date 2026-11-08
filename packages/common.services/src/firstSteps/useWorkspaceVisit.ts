import { useEffect } from 'react';
import { useCurrentUser } from '../user';
import { useUpdateUserFlag } from '../userFlags';
import { shouldShowFirstSteps } from './preview';
import { markFirstStepDone } from './useCompleteFirstStep';

const VISIT_KEY = 'sovlium.firstSteps.workspaceVisit';

const rememberVisit = (kind: 'board' | 'note'): boolean => {
  if (typeof sessionStorage === 'undefined') return false;
  let visit: { board?: boolean; note?: boolean } = {};
  try {
    visit = JSON.parse(sessionStorage.getItem(VISIT_KEY) ?? '{}') as {
      board?: boolean;
      note?: boolean;
    };
  } catch {
    visit = {};
  }
  visit[kind] = true;
  sessionStorage.setItem(VISIT_KEY, JSON.stringify(visit));
  return visit.board === true && visit.note === true;
};

/** Шаг «доска и заметка» засчитывается, когда открыты оба материала. */
export const useFirstStepsWorkspaceVisit = (kind: 'board' | 'note') => {
  const { data: user } = useCurrentUser();
  const { updateUserFlag } = useUpdateUserFlag();

  useEffect(() => {
    if (!user || user.default_layout !== 'tutor' || !shouldShowFirstSteps(user.onboarding_stage)) {
      return;
    }
    if (!rememberVisit(kind)) return;
    markFirstStepDone(user, 'workspace', updateUserFlag.mutate);
  }, [kind, updateUserFlag.mutate, user]);
};
