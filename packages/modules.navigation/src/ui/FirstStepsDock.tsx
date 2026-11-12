import { useLocation, useNavigate } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import {
  browserDemoCabinetStorage,
  countResolvedFirstSteps,
  firstStepsTotal,
  isStudentClassroomBlocked,
  isTutorLessonBlocked,
  pickExpandedStepId,
  readDemoCabinetProgress,
  requestFirstStepsTour,
  shouldShowFirstSteps,
  stepsForRole,
  useCurrentUser,
  useFetchClassrooms,
  useFetchClassroomsByStudent,
  useFirstStepsProgress,
  type FirstStepId,
  type FirstStepsRole,
} from 'common.services';

const ProgressRing = ({ value, total }: { value: number; total: number }) => {
  const radius = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = total === 0 ? 0 : Math.min(1, value / total);

  return (
    <svg viewBox="0 0 16 16" className="text-text-secondary/40 size-4 shrink-0" aria-hidden>
      <circle cx="8" cy="8" r={radius} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle
        cx="8"
        cy="8"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-text-primary"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        transform="rotate(-90 8 8)"
      />
    </svg>
  );
};

const StatusMark = ({ done }: { done: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    className={`size-4 shrink-0 ${done ? 'text-text-primary' : 'text-text-secondary'}`}
    aria-hidden
  >
    <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
    {done ? (
      <path
        d="M5 8.1 7 10.1 11.2 5.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : null}
  </svg>
);

const tourSteps = new Set<FirstStepId>([
  'navigation',
  'settings',
  'cabinet',
  'call',
  'workspace',
  'invite',
  'material',
  'lesson',
  'join',
  'classroom',
  'schedule',
]);

/** Компактный гайд над профилем, когда полный список на главной не виден. */
export const FirstStepsDock = () => {
  const { pathname } = useLocation();
  const { data: user } = useCurrentUser();
  const role = user?.default_layout;
  if (
    !user ||
    typeof user.id !== 'number' ||
    (role !== 'tutor' && role !== 'student') ||
    pathname === '/' ||
    !shouldShowFirstSteps(user.onboarding_stage ?? undefined)
  ) {
    return null;
  }

  return <FirstStepsDockCard userId={user.id} role={role} />;
};

const FirstStepsDockCard = ({ userId, role }: { userId: number; role: FirstStepsRole }) => {
  const { t } = useTranslation('main');
  const navigate = useNavigate();
  const { marks, introSeen, markSkipped } = useFirstStepsProgress(userId, role);
  const isTutor = role === 'tutor';
  const tutorClassrooms = useFetchClassrooms(undefined, !isTutor);
  const studentClassrooms = useFetchClassroomsByStudent(undefined, isTutor);
  const classroomQuery = isTutor ? tutorClassrooms : studentClassrooms;
  const classroomCount = classroomQuery.isLoading ? null : (classroomQuery.data?.length ?? 0);

  const steps = stepsForRole(role).map((id) => ({
    id,
    status: marks[id],
    blocked:
      id === 'lesson'
        ? isTutorLessonBlocked(classroomCount)
        : id === 'classroom'
          ? isStudentClassroomBlocked(classroomCount)
          : false,
  }));
  const currentId = pickExpandedStepId(steps, null);
  const order = stepsForRole(role);
  const currentIndex = order.findIndex((id) => id === currentId);
  const nextId = currentIndex >= 0 ? (order[currentIndex + 1] ?? null) : null;
  const resolved = countResolvedFirstSteps(marks, role);
  const total = firstStepsTotal(role);

  if (resolved === total) return null;

  const startTour = (step: FirstStepId) => {
    const demo = isTutor ? readDemoCabinetProgress(browserDemoCabinetStorage(), userId) : null;
    const classroomId = isTutor
      ? (demo?.classroomId ?? null)
      : (studentClassrooms.data?.[0]?.id.toString() ?? null);

    requestFirstStepsTour({
      step,
      role,
      userId,
      classroomId,
      boardId: demo?.boardId ?? null,
      noteId: demo?.noteId ?? null,
    });
  };

  const current = currentId ? steps.find((step) => step.id === currentId) : undefined;
  const next = nextId ? steps.find((step) => step.id === nextId) : undefined;
  const currentTitle = current ? t(`firstSteps.${role}.${current.id}.title`) : '';
  const nextTitle = next ? t(`firstSteps.${role}.${next.id}.title`) : '';

  return (
    <section
      className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden"
      aria-label={t('firstSteps.title')}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-text-primary min-w-0 text-sm font-medium">{t('firstSteps.title')}</h2>
        <div
          className="text-text-secondary flex shrink-0 items-center gap-1.5 text-xs tabular-nums"
          aria-label={t('firstSteps.progressAria', { count: resolved, total })}
        >
          <span>{t('firstSteps.progress', { count: resolved, total })}</span>
          <ProgressRing value={resolved} total={total} />
        </div>
      </div>

      {!introSeen || !current ? (
        <Button
          type="button"
          variant="primary"
          size="s"
          className="mt-2 h-8 self-start rounded-full text-xs"
          onClick={() => void navigate({ to: '/' })}
        >
          {t('firstSteps.welcomeAction')}
        </Button>
      ) : (
        <ol className="mt-2 flex flex-col">
          <li className="bg-background-subtle min-w-0 rounded-lg">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <span className="flex h-5 w-4 shrink-0 items-center justify-center">
                <StatusMark done={current.status === 'done'} />
              </span>
              <p className="text-text-primary min-w-0 flex-1 text-xs leading-4 font-medium break-words">
                {currentTitle}
                {current.status === 'skipped' ? (
                  <span className="text-text-secondary ml-1.5 text-[11px] leading-4 font-normal">
                    {t('firstSteps.skipped')}
                  </span>
                ) : null}
              </p>
            </div>
            <div className="pr-2 pb-2 pl-8">
              <p className="text-text-secondary text-xs leading-4 break-words">
                {current.blocked
                  ? t(`firstSteps.${role}.${current.id}.blocked`)
                  : t(`firstSteps.${role}.${current.id}.hint`)}
              </p>
              {!current.blocked && tourSteps.has(current.id) ? (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {current.status !== 'skipped' ? (
                    <Button
                      type="button"
                      variant="none"
                      size="s"
                      className="text-text-secondary hover:text-text-primary hover:bg-background-page active:text-text-primary active:bg-background-page h-8 rounded-full px-3 text-xs font-medium"
                      aria-label={t('firstSteps.skipAria', { title: currentTitle })}
                      onClick={() => markSkipped(current.id)}
                    >
                      {t('firstSteps.skip')}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="primary"
                    size="s"
                    className="h-8 rounded-full px-3 text-xs"
                    onClick={() => startTour(current.id)}
                  >
                    {t(`firstSteps.${role}.${current.id}.action`)}
                  </Button>
                </div>
              ) : null}
            </div>
          </li>
          {next ? (
            <li className="min-w-0 rounded-lg">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <span className="flex h-5 w-4 shrink-0 items-center justify-center">
                  <StatusMark done={next.status === 'done'} />
                </span>
                <p className="text-text-primary min-w-0 flex-1 text-xs leading-4 font-medium break-words">
                  {nextTitle}
                  {next.status === 'skipped' ? (
                    <span className="text-text-secondary ml-1.5 text-[11px] leading-4 font-normal">
                      {t('firstSteps.skipped')}
                    </span>
                  ) : null}
                </p>
              </div>
            </li>
          ) : null}
        </ol>
      )}
    </section>
  );
};
