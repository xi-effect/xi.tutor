import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { HelpCircle, MessageHeartCircle } from '@xipkg/icons';
import { Logo, useSupportModalStore } from 'common.ui';
import { useDemoCabinet } from '../../../demoCabinet/useDemoCabinet';
import { ModalInvitation } from 'features.invites';
import {
  FIRST_STEPS_COLLAPSED,
  FIRST_STEPS_TOUR_ACTION_EVENT,
  DEMO_CABINET_NAMES,
  firstStepsTotal,
  clearFirstStepsTour,
  countResolvedFirstSteps,
  isStudentClassroomBlocked,
  pickExpandedStepId,
  stepsForRole,
  useFetchClassrooms,
  useFetchClassroomsByStudent,
  useFirstStepsProgress,
  useGetMaterialsList,
  useInvitationsList,
  trackFirstStepsAction,
  trackFirstStepsFinishFailed,
  trackFirstStepsFinished,
  trackFirstStepsHelp,
  trackFirstStepsScreen,
  trackFirstStepsViewed,
  hideFirstStepsPreview,
  requestFirstStepsTour,
  useOnboardingTransition,
  type FirstStepId,
  type FirstStepsRole,
} from 'common.services';

type FirstStepsProps = {
  userId: number;
  role: FirstStepsRole;
  /** Просмотр без этапа training: выход прячет карточку и не вызывает сервер. */
  localPreview?: boolean;
  onLocalPreviewClose?: () => void;
};

const revealEase = [0.22, 1, 0.36, 1] as const;

const stepListVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.05 },
  },
};

const stepItemVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const GuideButton = (props: ComponentProps<typeof Button>) => <Button {...props} />;

const helpLinkClass =
  'hover:bg-background-subtle focus-visible:bg-background-subtle flex items-center gap-2 rounded-lg bg-transparent px-3 py-2 transition-colors focus-visible:outline-none';
const helpIconClass =
  'hover:text-text-secondary! focus:text-text-secondary! text-text-secondary! dark:text-text-muted! dark:hover:text-text-muted! dark:focus:text-text-muted! size-6 shrink-0';
const helpLabelClass =
  'text-s-base hover:text-text-secondary! focus:text-text-secondary! text-text-secondary! dark:text-text-muted! dark:hover:text-text-muted! dark:focus:text-text-muted! font-medium';

const ProgressRing = ({ value, total }: { value: number; total: number }) => {
  const reduceMotion = useReducedMotion();
  const radius = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = total === 0 ? 0 : Math.min(1, value / total);

  return (
    <svg viewBox="0 0 16 16" className="text-text-secondary/40 size-4 shrink-0" aria-hidden>
      <circle cx="8" cy="8" r={radius} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <motion.circle
        cx="8"
        cy="8"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-text-primary"
        strokeDasharray={circumference}
        transform="rotate(-90 8 8)"
        initial={false}
        animate={{ strokeDashoffset: circumference * (1 - progress) }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: revealEase }}
      />
    </svg>
  );
};

const StatusMark = ({ done }: { done: boolean }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 16 16"
      className={`size-4 shrink-0 ${done ? 'text-text-primary' : 'text-text-secondary'}`}
      aria-hidden
    >
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {done && (
        <motion.path
          d="M5 8.1 7 10.1 11.2 5.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.32, ease: revealEase }}
        />
      )}
    </motion.svg>
  );
};

export const FirstSteps = ({
  userId,
  role,
  localPreview = false,
  onLocalPreviewClose,
}: FirstStepsProps) => {
  const { t } = useTranslation('main');
  const { t: tNav } = useTranslation('navigation');
  const openSupport = useSupportModalStore((state) => state.open);
  const reduceMotion = useReducedMotion();
  const reveal = useMemo(
    () => (reduceMotion ? { duration: 0 } : { duration: 0.34, ease: revealEase }),
    [reduceMotion],
  );
  const { marks, introSeen, startGuide, markDone, markSkipped } = useFirstStepsProgress(
    userId,
    role,
    { analytics: !localPreview },
  );
  const { transitionStage } = useOnboardingTransition('completed', 'forwards');
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [joinHelpOpen, setJoinHelpOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [reviewSteps, setReviewSteps] = useState(false);

  const isTutor = role === 'tutor';
  const invitations = useInvitationsList(!isTutor);
  const materials = useGetMaterialsList({ disabled: !isTutor });
  const tutorClassrooms = useFetchClassrooms(undefined, !isTutor);
  const studentClassrooms = useFetchClassroomsByStudent(undefined, isTutor);

  const classroomQuery = isTutor ? tutorClassrooms : studentClassrooms;
  const classroomCount = classroomQuery.isLoading ? null : (classroomQuery.data?.length ?? 0);
  const tutorClassroomsSettled =
    isTutor && !localPreview && tutorClassrooms.isSuccess && !tutorClassrooms.isError;
  const demoCabinet = useDemoCabinet(
    userId,
    tutorClassroomsSettled,
    tutorClassroomsSettled && classroomCount === 0,
  );
  const demoClassroomId = demoCabinet.classroomId;

  useEffect(() => {
    if (localPreview) return;
    trackFirstStepsViewed(role);
  }, [localPreview, role]);

  useEffect(() => {
    if (!isTutor || invitations.isError || !Array.isArray(invitations.data)) return;
    if (invitations.data.length > 0) markDone('invite');
  }, [invitations.data, invitations.isError, isTutor, markDone]);

  useEffect(() => {
    if (!isTutor || !Array.isArray(materials.data) || materials.data.length === 0) return;
    const demoClassroomId =
      demoCabinet.classroomId == null ? null : Number(demoCabinet.classroomId);
    const demoIds = new Set(
      [demoCabinet.boardId, demoCabinet.noteId].filter((id): id is string => Boolean(id)),
    );
    const hasOwnMaterial = materials.data.some((item) => {
      if (demoIds.has(String(item.id))) return false;
      if (
        demoClassroomId != null &&
        'classroom_id' in item &&
        item.classroom_id === demoClassroomId
      ) {
        return false;
      }
      if (item.name === DEMO_CABINET_NAMES.board || item.name === DEMO_CABINET_NAMES.note) {
        return false;
      }
      return true;
    });
    if (!hasOwnMaterial) return;
    markDone('material');
  }, [
    demoCabinet.boardId,
    demoCabinet.classroomId,
    demoCabinet.noteId,
    isTutor,
    markDone,
    materials.data,
  ]);

  useEffect(() => {
    if (isTutor || classroomQuery.isLoading || classroomCount === 0) return;
    if (classroomCount && classroomCount > 0) markDone('join');
  }, [classroomCount, classroomQuery.isLoading, isTutor, markDone]);

  const steps = stepsForRole(role).map((id) => ({
    id,
    status: marks[id],
    blocked: id === 'classroom' ? isStudentClassroomBlocked(classroomCount) : false,
  }));
  const expandedId = pickExpandedStepId(steps, pinnedId);
  const resolved = countResolvedFirstSteps(marks, role);
  const totalSteps = firstStepsTotal(role);
  const allResolved = resolved === totalSteps;
  const showReady = isTutor && allResolved && !reviewSteps;
  const firstClassroom = studentClassrooms.data?.[0];
  const finishStarted = useRef(false);

  useEffect(() => {
    if (localPreview) return;
    const screen = !introSeen ? 'welcome' : showReady ? 'ready' : 'checklist';
    trackFirstStepsScreen(role, screen, resolved, totalSteps);
  }, [introSeen, localPreview, resolved, role, showReady, totalSteps]);

  useEffect(() => {
    if (!showReady) return;
    clearFirstStepsTour();
  }, [showReady]);

  const finish = (completionPath: 'tour_done' | 'skipped') => {
    if (localPreview) {
      hideFirstStepsPreview();
      onLocalPreviewClose?.();
      return;
    }

    if (finishStarted.current || transitionStage.isPending) return;
    finishStarted.current = true;
    trackFirstStepsAction(role, completionPath === 'tour_done' ? 'finish' : 'finish_early');

    // PUT .../onboarding-stages/completed/?transition_mode=forwards
    transitionStage.mutate(undefined, {
      onSuccess: () => {
        trackFirstStepsFinished(role, completionPath);
      },
      onError: (error) => {
        finishStarted.current = false;
        trackFirstStepsFinishFailed(role, error);
      },
    });
  };

  useEffect(() => {
    const onTourAction = (event: Event) => {
      const step = (event as CustomEvent<string>).detail;
      if (step === 'invite') setInviteOpen(true);
    };

    window.addEventListener(FIRST_STEPS_TOUR_ACTION_EVENT, onTourAction);
    return () => window.removeEventListener(FIRST_STEPS_TOUR_ACTION_EVENT, onTourAction);
  }, []);

  const startTour = async (step: FirstStepId) => {
    if (!localPreview) trackFirstStepsAction(role, 'start_step', step);
    let classroomId = isTutor
      ? (demoClassroomId?.toString() ?? null)
      : (firstClassroom?.id.toString() ?? null);
    let boardId = isTutor ? demoCabinet.boardId : null;
    let noteId = isTutor ? demoCabinet.noteId : null;
    const needsDemo = isTutor && (step === 'cabinet' || step === 'call');

    if (needsDemo && classroomId == null) {
      try {
        const ready = await Promise.race([
          demoCabinet.whenReady(),
          new Promise<null>((resolve) => {
            window.setTimeout(() => resolve(null), 400);
          }),
        ]);
        if (ready?.classroomId != null) {
          classroomId = ready.classroomId.toString();
          boardId = ready.boardId;
          noteId = ready.noteId;
        }
      } catch {
        classroomId = classroomId ?? null;
      }
    }

    if (isTutor && classroomId == null && (step === 'cabinet' || step === 'call')) {
      const classrooms = tutorClassrooms.data ?? [];
      const demoClassroom = classrooms.find(
        (classroom) => classroom.name === DEMO_CABINET_NAMES.classroom,
      );
      const fallbackClassroom = demoClassroom ?? classrooms[0];
      if (fallbackClassroom) classroomId = String(fallbackClassroom.id);
    }

    if (step === 'material' && classroomId == null) {
      try {
        const ready = await Promise.race([
          demoCabinet.whenReady(),
          new Promise<null>((resolve) => {
            window.setTimeout(() => resolve(null), 400);
          }),
        ]);
        if (ready?.classroomId != null) {
          classroomId = ready.classroomId.toString();
          boardId = ready.boardId;
          noteId = ready.noteId;
        }
      } catch {
        classroomId = null;
      }
    }

    requestFirstStepsTour({
      step,
      role,
      userId,
      classroomId,
      boardId,
      noteId,
    });
  };

  const toggleStep = (stepId: string) => {
    setPinnedId((current) => {
      const opened = pickExpandedStepId(steps, current) === stepId;
      return opened ? FIRST_STEPS_COLLAPSED : stepId;
    });
  };

  return (
    <section
      className={`relative flex min-h-full w-full items-center justify-center px-5 py-10 ${showReady ? 'pb-24' : ''}`}
    >
      <div className="flex w-full max-w-2xl min-w-0 flex-col items-center gap-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reveal}
        >
          <Logo width={148} height={40} />
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {!introSeen ? (
            <motion.div
              key="welcome"
              className="flex w-full min-w-0 flex-col items-center gap-6 text-center"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, pointerEvents: 'none' }}
              transition={reveal}
            >
              <div className="flex flex-col gap-2">
                <h1 id="first-steps-title" className="text-text-primary text-3xl font-semibold">
                  {t(`firstSteps.welcome.${role}.title`)}
                </h1>
                <p className="text-text-secondary text-base leading-6 break-words">
                  {t(`firstSteps.welcome.${role}.body`)}
                </p>
              </div>
              <GuideButton
                type="button"
                variant="primary"
                className="h-12 rounded-xl px-6 text-base font-medium"
                onClick={() => {
                  if (!localPreview) trackFirstStepsAction(role, 'start');
                  startGuide();
                }}
              >
                {t(`firstSteps.welcome.${role}.action`)}
              </GuideButton>
              <p className="text-text-secondary text-sm leading-5">
                {t(`firstSteps.welcome.${role}.note`)}
              </p>
            </motion.div>
          ) : showReady ? (
            <motion.div
              key="ready"
              className="flex w-full min-w-0 flex-col items-center gap-6 text-center"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, pointerEvents: 'none' }}
              transition={reveal}
            >
              <div className="flex flex-col gap-2">
                <h1 id="first-steps-title" className="text-text-primary text-3xl font-semibold">
                  {t('firstSteps.doneTitle')}
                </h1>
                <p className="text-text-secondary text-base leading-6 break-words">
                  {t('firstSteps.doneBody')}
                </p>
                <p className="text-text-secondary text-base leading-6 break-words">
                  {t('firstSteps.doneNote')}
                </p>
              </div>
              <GuideButton
                type="button"
                variant="primary"
                className="h-12 rounded-xl px-6 text-base font-medium"
                disabled={transitionStage.isPending}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  finish('tour_done');
                }}
                onClick={() => finish('tour_done')}
              >
                {t('firstSteps.doneAction')}
              </GuideButton>
              <GuideButton
                type="button"
                variant="none"
                size="s"
                className="text-text-secondary hover:text-text-primary hover:bg-background-subtle active:text-text-primary active:bg-background-subtle h-8 rounded-full px-3 font-medium transition-colors"
                onClick={() => {
                  if (!localPreview) trackFirstStepsAction(role, 'review');
                  setReviewSteps(true);
                }}
              >
                {t('firstSteps.back')}
              </GuideButton>
            </motion.div>
          ) : (
            <motion.div
              key="steps"
              className="flex w-full min-w-0 flex-col"
              aria-labelledby="first-steps-title"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, pointerEvents: 'none' }}
              transition={reveal}
            >
              <div className="flex items-center justify-between gap-3 px-1">
                <h1
                  id="first-steps-title"
                  className="text-text-primary min-w-0 text-base font-medium"
                >
                  {t('firstSteps.title')}
                </h1>
                <div
                  className="text-text-secondary flex shrink-0 items-center gap-2 text-sm tabular-nums"
                  aria-label={t('firstSteps.progressAria', {
                    count: resolved,
                    total: totalSteps,
                  })}
                >
                  <span>{t('firstSteps.progress', { count: resolved, total: totalSteps })}</span>
                  <ProgressRing value={resolved} total={totalSteps} />
                </div>
              </div>

              <motion.ol
                className="mt-3 flex flex-col"
                initial={reduceMotion ? false : 'hidden'}
                animate="show"
                variants={stepListVariants}
              >
                {steps.map((step) => {
                  const open = expandedId === step.id;
                  const title = t(`firstSteps.${role}.${step.id}.title`);
                  const detail =
                    step.blocked && step.id === 'classroom'
                      ? t(`firstSteps.${role}.${step.id}.blocked`)
                      : t(`firstSteps.${role}.${step.id}.hint`);

                  return (
                    <motion.li
                      key={step.id}
                      variants={stepItemVariants}
                      transition={reveal}
                      className={`min-w-0 rounded-lg transition-colors duration-300 ${open ? 'bg-background-subtle' : ''}`}
                    >
                      <div className="flex items-center gap-3 px-3 py-2">
                        <span className="flex h-5 w-4 shrink-0 items-center justify-center">
                          <StatusMark done={step.status === 'done'} />
                        </span>
                        <button
                          type="button"
                          className="text-text-primary focus-visible:ring-text-link min-w-0 flex-1 bg-transparent p-0 text-left text-sm leading-5 font-medium break-words focus-visible:ring-2 focus-visible:outline-none"
                          aria-expanded={open}
                          onClick={() => {
                            const opened = pickExpandedStepId(steps, pinnedId) === step.id;
                            if (!opened && !localPreview) {
                              trackFirstStepsAction(role, 'open_step', step.id);
                            }
                            toggleStep(step.id);
                          }}
                        >
                          {title}
                          {step.status === 'skipped' && (
                            <span className="text-text-secondary ml-2 text-xs font-normal">
                              {t('firstSteps.skipped')}
                            </span>
                          )}
                        </button>
                      </div>
                      <div
                        className={`grid ${reduceMotion ? '' : 'transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'} ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                      >
                        <div className="min-h-0 overflow-hidden" inert={!open}>
                          <div className="pr-3 pb-3 pl-10">
                            <p className="text-text-secondary text-sm leading-5 break-words">
                              {detail}
                              {step.id === 'join' && joinHelpOpen && (
                                <span id="first-steps-join-help" className="mt-1 block">
                                  {t('firstSteps.joinHelp')}
                                </span>
                              )}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {step.status === 'pending' && (
                                <GuideButton
                                  type="button"
                                  variant="none"
                                  size="s"
                                  className="text-text-secondary hover:text-text-primary hover:bg-background-page active:text-text-primary active:bg-background-page h-8 rounded-full px-3 font-medium"
                                  aria-label={t('firstSteps.skipAria', { title })}
                                  onClick={() => {
                                    markSkipped(step.id);
                                    setPinnedId(null);
                                  }}
                                >
                                  {t(
                                    step.id === 'navigation' ||
                                      step.id === 'settings' ||
                                      step.id === 'cabinet' ||
                                      step.id === 'material'
                                      ? 'firstSteps.skipStep'
                                      : 'firstSteps.skip',
                                  )}
                                </GuideButton>
                              )}
                              {(step.id === 'navigation' ||
                                step.id === 'settings' ||
                                step.id === 'cabinet' ||
                                step.id === 'call') && (
                                <GuideButton
                                  type="button"
                                  variant="primary"
                                  size="s"
                                  className="rounded-full"
                                  onClick={() => void startTour(step.id)}
                                >
                                  {t(`firstSteps.tutor.${step.id}.action`)}
                                </GuideButton>
                              )}
                              {step.id === 'invite' && (
                                <GuideButton
                                  type="button"
                                  variant="primary"
                                  size="s"
                                  className="rounded-full"
                                  data-first-step="invite-action"
                                  onClick={() => startTour('invite')}
                                >
                                  {t('firstSteps.tutor.invite.action')}
                                </GuideButton>
                              )}
                              {step.id === 'material' && (
                                <GuideButton
                                  type="button"
                                  variant="primary"
                                  size="s"
                                  className="rounded-full"
                                  onClick={() => startTour('material')}
                                >
                                  {t('firstSteps.tutor.material.action')}
                                </GuideButton>
                              )}
                              {step.id === 'join' && (
                                <GuideButton
                                  type="button"
                                  variant="primary"
                                  size="s"
                                  className="rounded-full"
                                  aria-expanded={joinHelpOpen}
                                  aria-controls={joinHelpOpen ? 'first-steps-join-help' : undefined}
                                  onClick={() => {
                                    setJoinHelpOpen(true);
                                    startTour('join');
                                  }}
                                >
                                  {t('firstSteps.student.join.action')}
                                </GuideButton>
                              )}
                              {step.id === 'classroom' && !step.blocked && (
                                <GuideButton
                                  type="button"
                                  variant="primary"
                                  size="s"
                                  className="rounded-full"
                                  onClick={() => startTour('classroom')}
                                >
                                  {t('firstSteps.student.classroom.action')}
                                </GuideButton>
                              )}
                              {step.id === 'schedule' && (
                                <GuideButton
                                  type="button"
                                  variant="primary"
                                  size="s"
                                  className="rounded-full"
                                  onClick={() => startTour('schedule')}
                                >
                                  {t('firstSteps.student.schedule.action')}
                                </GuideButton>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ol>

              <motion.div
                className="mt-8 flex min-w-0 justify-center"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...reveal, delay: reduceMotion ? 0 : 0.2 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {allResolved ? (
                    <motion.div
                      key="home"
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0, pointerEvents: 'none' }}
                      transition={reveal}
                    >
                      <GuideButton
                        type="button"
                        variant="primary"
                        size="s"
                        className="rounded-full"
                        disabled={transitionStage.isPending}
                        onPointerDown={(event) => {
                          if (event.button !== 0) return;
                          finish('tour_done');
                        }}
                        onClick={() => finish('tour_done')}
                      >
                        {t(isTutor ? 'firstSteps.doneAction' : 'firstSteps.goHome')}
                      </GuideButton>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="finish"
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0, pointerEvents: 'none' }}
                      transition={reveal}
                    >
                      <GuideButton
                        type="button"
                        variant="none"
                        size="s"
                        className="text-text-secondary hover:text-text-primary hover:bg-background-subtle active:text-text-primary active:bg-background-page h-8 rounded-full px-3 font-medium"
                        disabled={transitionStage.isPending}
                        onPointerDown={(event) => {
                          if (event.button !== 0) return;
                          finish('skipped');
                        }}
                        onClick={() => finish('skipped')}
                      >
                        {t('firstSteps.finishEarly')}
                      </GuideButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {inviteOpen && (
        <ModalInvitation
          open
          analyticsSource="onboarding"
          onOpenChange={(open) => setInviteOpen(open)}
        />
      )}
      {showReady && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            className={helpLinkClass}
            data-umami-event="navigation-wiki"
            onClick={() => {
              if (!localPreview) trackFirstStepsHelp('wiki');
              window.open('https://support.sovlium.ru', '_blank');
            }}
          >
            <HelpCircle className={helpIconClass} />
            <span className={helpLabelClass}>{tNav('wiki')}</span>
          </button>
          <button
            type="button"
            className={helpLinkClass}
            data-umami-event="navigation-support"
            onClick={() => {
              if (!localPreview) trackFirstStepsHelp('support');
              openSupport();
            }}
          >
            <MessageHeartCircle className={helpIconClass} />
            <span className={helpLabelClass}>{tNav('support')}</span>
          </button>
        </div>
      )}
    </section>
  );
};
