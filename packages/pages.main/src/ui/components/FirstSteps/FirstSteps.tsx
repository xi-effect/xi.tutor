import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { Logo } from 'common.ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { FileSmall, WhiteBoard } from '@xipkg/icons';
import { AddingLessonModal } from 'features.lesson.add';
import { useDemoCabinet } from '../../../demoCabinet/useDemoCabinet';
import { ModalInvitation } from 'features.invites';
import { useCreateMaterial } from 'features.materials.add';
import {
  FIRST_STEPS_COLLAPSED,
  FIRST_STEPS_TOUR_ACTION_EVENT,
  DEMO_CABINET_NAMES,
  firstStepsTotal,
  countResolvedFirstSteps,
  isStudentClassroomBlocked,
  isTutorLessonBlocked,
  pickExpandedStepId,
  stepsForRole,
  useFetchClassrooms,
  useFetchClassroomsByStudent,
  useFirstStepsProgress,
  useGetMaterialsList,
  useInvitationsList,
  trackFirstStepsFinishFailed,
  trackFirstStepsFinished,
  trackFirstStepsViewed,
  hideFirstStepsPreview,
  requestFirstStepsTour,
  useOnboardingTransition,
  useTutorSchedule,
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

const scheduleProbeRange = () => {
  const now = new Date();
  const after = new Date(now);
  after.setFullYear(after.getFullYear() - 1);
  const before = new Date(now);
  before.setFullYear(before.getFullYear() + 2);
  return {
    happensAfter: after.toISOString(),
    happensBefore: before.toISOString(),
  };
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
const pressSpring: Transition = { type: 'spring', stiffness: 560, damping: 32 };

const MotionButton = motion.create(Button);

const GuideButton = ({ className, disabled, ...props }: ComponentProps<typeof Button>) => {
  const reduceMotion = useReducedMotion();

  return (
    <MotionButton
      {...props}
      disabled={disabled}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.96 }}
      transition={pressSpring}
      className={className}
    />
  );
};

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
  const reduceMotion = useReducedMotion();
  const reveal = useMemo(
    () => (reduceMotion ? { duration: 0 } : { duration: 0.34, ease: revealEase }),
    [reduceMotion],
  );
  const { marks, introSeen, startGuide, markDone, markSkipped } = useFirstStepsProgress(
    userId,
    role,
  );
  const { transitionStage } = useOnboardingTransition('completed', 'forwards');
  const { createMaterial, isPending: isCreatingMaterial } = useCreateMaterial();
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [joinHelpOpen, setJoinHelpOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [materialMenuOpen, setMaterialMenuOpen] = useState(false);

  const isTutor = role === 'tutor';
  const range = useMemo(scheduleProbeRange, []);
  const invitations = useInvitationsList(!isTutor);
  const materials = useGetMaterialsList({ disabled: !isTutor });
  const schedule = useTutorSchedule({ ...range, enabled: isTutor });
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
    trackFirstStepsViewed(role);
  }, [role]);

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
    if (!isTutor || !schedule.data || schedule.data.length === 0) return;
    markDone('lesson');
  }, [isTutor, markDone, schedule.data]);

  useEffect(() => {
    if (isTutor || classroomQuery.isLoading || classroomCount === 0) return;
    if (classroomCount && classroomCount > 0) markDone('join');
  }, [classroomCount, classroomQuery.isLoading, isTutor, markDone]);

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
  const expandedId = pickExpandedStepId(steps, pinnedId);
  const resolved = countResolvedFirstSteps(marks, role);
  const totalSteps = firstStepsTotal(role);
  const allResolved = resolved === totalSteps;
  const firstClassroom = studentClassrooms.data?.[0];

  const finish = (completionPath: 'tour_done' | 'skipped') => {
    if (localPreview) {
      hideFirstStepsPreview();
      onLocalPreviewClose?.();
      return;
    }

    if (transitionStage.isPending) return;

    transitionStage.mutate(undefined, {
      onSuccess: () => {
        trackFirstStepsFinished(role, completionPath);
      },
      onError: (error) => {
        trackFirstStepsFinishFailed(role, error);
      },
    });
  };

  useEffect(() => {
    const onTourAction = (event: Event) => {
      const step = (event as CustomEvent<string>).detail;
      if (step === 'invite') setInviteOpen(true);
      if (step === 'lesson') setLessonOpen(true);
      if (step === 'material') setMaterialMenuOpen(true);
    };

    window.addEventListener(FIRST_STEPS_TOUR_ACTION_EVENT, onTourAction);
    return () => window.removeEventListener(FIRST_STEPS_TOUR_ACTION_EVENT, onTourAction);
  }, []);

  const startTour = async (step: FirstStepId) => {
    let classroomId = isTutor
      ? (demoClassroomId?.toString() ?? null)
      : (firstClassroom?.id.toString() ?? null);
    let boardId = isTutor ? demoCabinet.boardId : null;
    let noteId = isTutor ? demoCabinet.noteId : null;
    const needsDemo = isTutor && (step === 'cabinet' || step === 'call' || step === 'workspace');

    if (needsDemo && (classroomId == null || (step === 'workspace' && (!boardId || !noteId)))) {
      try {
        const ready = await demoCabinet.whenReady();
        classroomId = ready.classroomId?.toString() ?? null;
        boardId = ready.boardId;
        noteId = ready.noteId;
      } catch (error) {
        console.error('Не удалось открыть демонстрационный кабинет', error);
        return;
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
    <section className="flex min-h-full w-full items-center justify-center px-5 py-10">
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
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={reveal}
            >
              <div className="flex flex-col gap-2">
                <h1 id="first-steps-title" className="text-text-primary text-3xl font-semibold">
                  {t('firstSteps.welcomeTitle')}
                </h1>
                <p className="text-text-secondary text-base leading-6 break-words">
                  {t('firstSteps.welcomeBody')}
                </p>
              </div>
              <GuideButton
                type="button"
                variant="primary"
                className="h-12 rounded-xl px-6 text-base font-medium"
                onClick={startGuide}
              >
                {t('firstSteps.welcomeAction')}
              </GuideButton>
            </motion.div>
          ) : (
            <motion.div
              key="steps"
              className="flex w-full min-w-0 flex-col"
              aria-labelledby="first-steps-title"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
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
                    step.blocked && (step.id === 'lesson' || step.id === 'classroom')
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
                          onClick={() => toggleStep(step.id)}
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
                                  {t('firstSteps.skip')}
                                </GuideButton>
                              )}
                              {(step.id === 'navigation' ||
                                step.id === 'settings' ||
                                step.id === 'cabinet' ||
                                step.id === 'call' ||
                                step.id === 'workspace') && (
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
                                <DropdownMenu
                                  open={materialMenuOpen}
                                  onOpenChange={(nextOpen) => {
                                    if (!nextOpen) setMaterialMenuOpen(false);
                                  }}
                                >
                                  <DropdownMenuTrigger asChild>
                                    <GuideButton
                                      type="button"
                                      variant="primary"
                                      size="s"
                                      className="rounded-full"
                                      data-first-step="material-action"
                                      disabled={isCreatingMaterial}
                                      onClick={(event) => {
                                        event.preventDefault();
                                        startTour('material');
                                      }}
                                    >
                                      {t('firstSteps.tutor.material.action')}
                                    </GuideButton>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="start"
                                    className="border-border-default bg-background-surface w-[min(16rem,calc(100vw-2.5rem))] rounded-xl border p-1"
                                  >
                                    <DropdownMenuItem
                                      className="focus:bg-background-page flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm"
                                      disabled={isCreatingMaterial}
                                      onSelect={() => createMaterial('board')}
                                    >
                                      <WhiteBoard className="fill-icon-primary size-4 shrink-0" />
                                      {t('firstSteps.tutor.material.board')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="focus:bg-background-page flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm"
                                      disabled={isCreatingMaterial}
                                      onSelect={() => createMaterial('note')}
                                    >
                                      <FileSmall className="fill-icon-primary size-4 shrink-0" />
                                      {t('firstSteps.tutor.material.note')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                              {step.id === 'lesson' && !step.blocked && (
                                <GuideButton
                                  type="button"
                                  variant="primary"
                                  size="s"
                                  className="rounded-full"
                                  data-first-step="lesson-action"
                                  onClick={() => startTour('lesson')}
                                >
                                  {t('firstSteps.tutor.lesson.action')}
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
                className="mt-10 flex min-w-0 justify-center"
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
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                      transition={reveal}
                    >
                      <GuideButton
                        type="button"
                        variant="primary"
                        size="s"
                        className="rounded-full"
                        disabled={transitionStage.isPending}
                        onClick={() => finish('tour_done')}
                      >
                        {t('firstSteps.goHome')}
                      </GuideButton>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="finish"
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                      transition={reveal}
                    >
                      <GuideButton
                        type="button"
                        variant="none"
                        size="s"
                        className="text-text-secondary hover:text-text-primary hover:bg-background-subtle active:text-text-primary active:bg-background-page h-8 rounded-full px-3 font-medium"
                        disabled={transitionStage.isPending}
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
      {isTutor && (
        <AddingLessonModal
          open={lessonOpen}
          onOpenChange={setLessonOpen}
          analyticsSource="onboarding"
          fixedClassroomId={demoClassroomId ?? undefined}
        />
      )}
    </section>
  );
};
