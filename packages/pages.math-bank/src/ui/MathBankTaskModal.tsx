import { useEffect, useState, type ReactNode } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Button } from '@xipkg/button';
import {
  BookOpened,
  Check,
  ChevronSmallBottom,
  Close,
  Copy,
  Flag,
  Hint,
  Redo,
  type IconProps,
} from '@xipkg/icons';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { cn } from '@xipkg/utils';
import {
  modalBodyClass,
  modalCloseIconClass,
  modalContentClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';
import {
  loadMathGrade,
  loadMathTaskById,
  type ExamKind,
  type MathGrade,
  type MathTask,
  type MathTaskSearchDocument,
} from 'features.math.bank';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  trackMathTaskAnswerOpen,
  trackMathTaskCopy,
  trackMathTaskHintOpen,
  trackMathTaskNextVariant,
  trackMathTaskOpen,
  trackMathTaskSolutionOpen,
} from 'common.utils';
import { useToggleMathBankFavorite } from '../hooks/useToggleMathBankFavorite';
import { useMathBankUserStore } from '../store/useMathBankUserStore';
import { toMathBankTaskSnapshot } from '../utils/analytics';
import { formatExamBadge, pickVisibleExamMappings } from '../utils/exam';
import { FavoriteHeart } from './FavoriteHeart';
import { MathBankLatex } from './MathBankLatex';
import { MathBankTaskReportForm } from './MathBankTaskReportForm';

type MathBankTaskModalProps = {
  task: MathTaskSearchDocument | null;
  onOpenChange: (open: boolean) => void;
  onTaskChange: (task: MathTaskSearchDocument) => void;
};

const headerIconButtonClass = cn(
  'group flex size-8 shrink-0 items-center justify-center rounded-lg p-0',
  'hover:bg-background-subtle focus:bg-background-subtle active:bg-background-subtle',
  'disabled:pointer-events-none disabled:opacity-40',
);

const variantTransition: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
  mass: 0.85,
};

const accordionTransition: Transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

const copyStatement = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

export const MathBankTaskModal = ({ task, onOpenChange, onTaskChange }: MathBankTaskModalProps) => {
  const { t } = useTranslation('mathBank');
  const open = Boolean(task);
  const favoriteTaskIds = useMathBankUserStore((state) => state.favoriteTaskIds);
  const toggleFavorite = useToggleMathBankFavorite();
  const addRecent = useMathBankUserStore((state) => state.addRecent);
  const [isVariantLoading, setIsVariantLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    answer: false,
    solution: false,
    hints: false,
  });

  const detailsQuery = useQuery({
    queryKey: ['math-bank', 'task', task?.id, task?.grade],
    queryFn: () => loadMathTaskById(task!.id, task!.grade as MathGrade),
    enabled: Boolean(task),
    placeholderData: isVariantLoading ? keepPreviousData : undefined,
  });

  useEffect(() => {
    setOpenSections({ answer: false, solution: false, hints: false });
    setReportOpen(false);
  }, [task?.id]);

  useEffect(() => {
    if (!task) {
      return;
    }
    addRecent(task.id);
    trackMathTaskOpen(toMathBankTaskSnapshot(task), 'page');
    // Смена варианта даёт новый id; объект preview может пересоздаваться без смены id.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- track only when the opened task changes
  }, [addRecent, task?.id]);

  useEffect(() => {
    if (!isVariantLoading) {
      return;
    }

    if (!detailsQuery.isFetching && detailsQuery.data?.id === task?.id) {
      setIsVariantLoading(false);
    }
  }, [detailsQuery.data?.id, detailsQuery.isFetching, isVariantLoading, task?.id]);

  const details = detailsQuery.data;
  const isFavorite = task ? favoriteTaskIds.includes(task.id) : false;
  const examLabels = {
    OGE: t('filters.exam.OGE'),
    EGE_BASE: t('filters.exam.EGE_BASE'),
    EGE_PROFILE: t('filters.exam.EGE_PROFILE'),
  } as Record<ExamKind, string>;

  const handleCopy = async () => {
    const statement = details?.statement.text ?? task?.statement;
    if (!statement) {
      return;
    }

    try {
      await copyStatement(statement);
      toast.success(t('task.copied'));
      if (task) {
        trackMathTaskCopy(toMathBankTaskSnapshot(task), 'page');
      }
    } catch {
      toast.error(t('task.copyError'));
    }
  };

  const handleNextVariant = async () => {
    if (!details || isVariantLoading) {
      return;
    }

    setIsVariantLoading(true);

    try {
      const gradeTasks = await loadMathGrade(details.grade);
      const variants = gradeTasks.filter(
        (item) =>
          item.generator.variantGroupId === details.generator.variantGroupId &&
          item.id !== details.id,
      );
      const next = variants[Math.floor(Math.random() * variants.length)];
      if (!next) {
        toast(t('task.noVariant'));
        setIsVariantLoading(false);
        return;
      }

      trackMathTaskNextVariant(toMathBankTaskSnapshot(details), 'page');
      onTaskChange({
        id: next.id,
        statement: next.statement.text,
        grade: next.grade,
        difficulty: next.difficulty,
        topicId: next.topicId,
        topic: next.topic,
        subtopic: next.subtopic,
        taskType: next.taskType,
        skills: next.skills,
        tags: next.tags,
        aliases: next.search.aliases,
        examMappings: next.examMappings,
      });
    } catch {
      setIsVariantLoading(false);
      toast.error(t('task.error'));
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className={cn(
          modalContentClass,
          'max-h-[90dvh] w-[min(800px,calc(100vw-32px))] max-w-[800px] overflow-y-auto',
        )}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <div className={modalBodyClass}>
          <div className={modalHeaderRowClass}>
            <ModalTitle className={cn(modalTitleClass, 'min-w-0 truncate')}>
              {task
                ? `${t('card.grade', { grade: task.grade })} · ${task.topic}`
                : t('task.loading')}
            </ModalTitle>
            <TooltipProvider delayDuration={300}>
              <div className="flex shrink-0 items-center gap-2.5">
                <HeaderIconButton
                  tooltip={t('task.copy')}
                  umamiEvent="math-bank-task-copy"
                  onClick={handleCopy}
                >
                  <Copy className="fill-icon-secondary size-5" />
                </HeaderIconButton>
                <HeaderIconButton
                  tooltip={t('task.nextVariant')}
                  umamiEvent="math-bank-task-next-variant"
                  disabled={!details || isVariantLoading}
                  onClick={handleNextVariant}
                >
                  <motion.span
                    className="flex"
                    animate={isVariantLoading ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                      isVariantLoading
                        ? { repeat: Infinity, duration: 0.7, ease: 'linear' }
                        : { duration: 0.2 }
                    }
                  >
                    <Redo className="fill-icon-secondary size-5" />
                  </motion.span>
                </HeaderIconButton>
                {task ? (
                  <HeaderIconButton
                    tooltip={t('task.report')}
                    umamiEvent="math-bank-task-report"
                    pressed={reportOpen}
                    onClick={() => setReportOpen((current) => !current)}
                  >
                    <Flag className="fill-icon-secondary size-5" />
                  </HeaderIconButton>
                ) : null}
                {task ? (
                  <HeaderIconButton
                    tooltip={isFavorite ? t('card.favoriteRemove') : t('card.favoriteAdd')}
                    umamiEvent="math-bank-task-favorite-toggle"
                    onClick={() => toggleFavorite(task.id)}
                  >
                    <FavoriteHeart active={isFavorite} className="size-5" />
                  </HeaderIconButton>
                ) : null}
                <HeaderIconButton tooltip={t('task.close')} onClick={() => onOpenChange(false)}>
                  <Close className={modalCloseIconClass} />
                </HeaderIconButton>
              </div>
            </TooltipProvider>
          </div>

          {task && reportOpen ? (
            <MathBankTaskReportForm task={task} onClose={() => setReportOpen(false)} />
          ) : null}

          {task ? (
            <div className="relative overflow-x-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={variantTransition}
                >
                  <TaskDetails
                    preview={task}
                    details={detailsQuery.isError ? undefined : (details ?? undefined)}
                    detailsError={detailsQuery.isError}
                    examLabels={examLabels}
                    openSections={openSections}
                    onToggleSection={(section) => {
                      if (!openSections[section] && task) {
                        const snapshot = toMathBankTaskSnapshot(task);
                        if (section === 'answer') {
                          trackMathTaskAnswerOpen(snapshot, 'page');
                        } else if (section === 'solution') {
                          trackMathTaskSolutionOpen(snapshot, 'page');
                        } else {
                          trackMathTaskHintOpen(snapshot, 'page');
                        }
                      }
                      setOpenSections((current) => ({ ...current, [section]: !current[section] }));
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          ) : null}
        </div>
      </ModalContent>
    </Modal>
  );
};

type HeaderIconButtonProps = {
  tooltip: string;
  umamiEvent?: string;
  disabled?: boolean;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
};

const HeaderIconButton = ({
  tooltip,
  umamiEvent,
  disabled = false,
  pressed,
  onClick,
  children,
}: HeaderIconButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="none"
        size="icon"
        className={headerIconButtonClass}
        onClick={onClick}
        disabled={disabled}
        aria-label={tooltip}
        aria-pressed={pressed}
        data-umami-event={umamiEvent}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="z-[200]">
      {tooltip}
    </TooltipContent>
  </Tooltip>
);

type TaskSection = 'answer' | 'solution' | 'hints';

type TaskDetailsProps = {
  preview: MathTaskSearchDocument;
  details?: MathTask;
  detailsError: boolean;
  examLabels: Record<ExamKind, string>;
  openSections: Record<TaskSection, boolean>;
  onToggleSection: (section: TaskSection) => void;
};

const TaskDetails = ({
  preview,
  details,
  detailsError,
  examLabels,
  openSections,
  onToggleSection,
}: TaskDetailsProps) => {
  const { t } = useTranslation('mathBank');
  const badges = pickVisibleExamMappings(preview.examMappings);
  const showHints = !details || details.hints.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-s-base text-text-secondary">
        {preview.subtopic}
        {preview.taskType ? ` · ${t(`filters.type.${preview.taskType}`)}` : null}
      </p>
      <p className="text-m-base text-text-primary leading-6">
        <MathBankLatex text={details?.statement.text ?? preview.statement} />
      </p>
      {badges.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {badges.map((mapping) => {
            const badge = formatExamBadge(mapping, examLabels);
            return (
              <span
                key={`${mapping.exam}-${mapping.year}-${badge.number}-${mapping.relation}`}
                className="bg-status-info-background text-xs-base text-text-secondary rounded-lg px-2 py-1"
              >
                {t(`examBadge.${mapping.relation}`, {
                  exam: badge.exam,
                  year: badge.year,
                  number: badge.number,
                })}
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <AccordionItem
          title={t('task.answer')}
          icon={Check}
          open={openSections.answer}
          onToggle={() => details && onToggleSection('answer')}
          umamiEvent="math-bank-task-answer"
        >
          {detailsError ? (
            <p className="text-s-base text-text-secondary">{t('task.error')}</p>
          ) : details ? (
            <p className="text-m-base text-text-primary">
              <MathBankLatex text={details.answer.display} />
            </p>
          ) : (
            <p className="text-s-base text-text-secondary">{t('task.loading')}</p>
          )}
        </AccordionItem>
        <AccordionItem
          title={t('task.solution')}
          icon={BookOpened}
          open={openSections.solution}
          onToggle={() => details && onToggleSection('solution')}
          umamiEvent="math-bank-task-solution"
        >
          {detailsError ? (
            <p className="text-s-base text-text-secondary">{t('task.error')}</p>
          ) : details ? (
            <ol className="text-s-base text-text-primary flex list-decimal flex-col gap-2.5 pl-5">
              {details.solution.steps.map((step) => (
                <li key={step} className="pl-1">
                  <MathBankLatex text={step} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-s-base text-text-secondary">{t('task.loading')}</p>
          )}
        </AccordionItem>
        {showHints ? (
          <AccordionItem
            title={t('task.hints')}
            icon={Hint}
            open={openSections.hints}
            onToggle={() => details && onToggleSection('hints')}
            umamiEvent="math-bank-task-hint"
          >
            {detailsError ? (
              <p className="text-s-base text-text-secondary">{t('task.error')}</p>
            ) : details ? (
              <div className="flex flex-col gap-3">
                {details.hints.map((hint, index) => (
                  <div key={hint} className="flex gap-3">
                    {details.hints.length > 1 ? (
                      <span className="bg-status-info-background text-xs-base text-text-primary flex size-6 shrink-0 items-center justify-center rounded-full font-medium">
                        {index + 1}
                      </span>
                    ) : null}
                    <p className="text-s-base text-text-primary min-w-0 flex-1 leading-5">
                      <MathBankLatex text={hint} />
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-s-base text-text-secondary">{t('task.loading')}</p>
            )}
          </AccordionItem>
        ) : null}
      </div>
    </div>
  );
};

type AccordionItemProps = {
  title: string;
  icon: (props: IconProps) => ReactNode;
  open: boolean;
  onToggle: () => void;
  umamiEvent: string;
  children: ReactNode;
};

const AccordionItem = ({
  title,
  icon: Icon,
  open,
  onToggle,
  umamiEvent,
  children,
}: AccordionItemProps) => (
  <div
    className={cn(
      'overflow-hidden rounded-2xl border transition-colors',
      open ? 'border-border-focus' : 'border-border-default',
    )}
  >
    <button
      type="button"
      className="flex w-full items-center gap-3 bg-transparent px-3 py-3 text-left"
      onClick={onToggle}
      aria-expanded={open}
      data-umami-event={umamiEvent}
    >
      <span className="bg-status-info-background flex size-9 shrink-0 items-center justify-center rounded-[10px]">
        <Icon className="fill-icon-brand size-5" />
      </span>
      <span className="text-m-base text-text-primary min-w-0 flex-1 font-medium">{title}</span>
      <motion.span
        className="flex size-7 shrink-0 items-center justify-center"
        animate={{ rotate: open ? 180 : 0 }}
        transition={accordionTransition}
      >
        <ChevronSmallBottom className="fill-icon-secondary size-4" />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={accordionTransition}
          className="overflow-hidden"
        >
          <div className="px-4 pb-3">{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  </div>
);
