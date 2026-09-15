import { useTranslation } from 'react-i18next';
import { InfoCircle } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTypicalLessonDuration } from 'common.ui';
import { CARD_MAX_WIDTH, CARD_MIN_WIDTH } from '../../../hooks/useKanbanColumns';
import { timeToString } from '../../../utils';
import { canFitTypicalLesson } from '../../../utils/canFitTypicalLesson';
import { formatFreeSlotDuration } from '../../../utils/formatFreeSlotDuration';
import type { TimedFeedItem } from '../../../utils/interleaveWithFreeTimeGaps';

type FeedNoteLayout = {
  variant?: 'card' | 'list';
  fullWidth?: boolean;
};

type ScheduleFeedNoteProps = FeedNoteLayout & {
  entry: Extract<TimedFeedItem<unknown>, { kind: 'gap' } | { kind: 'overlap' }>;
};

const noteLayoutClass = (variant: FeedNoteLayout['variant']) =>
  cn(
    // -my-* схлопывает gap колонки (gap-3/gap-4), чтобы подпись не занимала высоту карточки
    '-my-3 flex h-5 w-full shrink-0 items-center justify-center gap-1 py-0 leading-none',
    variant === 'list' && 'px-4',
  );

const noteTextClass = 'text-[11px] leading-none font-normal';

const noteLayoutStyle = ({ variant = 'card', fullWidth = false }: FeedNoteLayout) =>
  fullWidth || variant === 'list'
    ? { width: '100%' as const }
    : { minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH };

export const ScheduleFreeSlot = ({
  start,
  end,
  variant = 'card',
  fullWidth = false,
}: FeedNoteLayout & { start: Date; end: Date }) => {
  const { t } = useTranslation('calendar');
  const { durationMinutes } = useTypicalLessonDuration();
  const duration = formatFreeSlotDuration(start, end, t);
  const label = t('free_slot_label', { duration });
  const canFitLesson = canFitTypicalLesson(start, end, durationMinutes);

  return (
    <div
      className={noteLayoutClass(variant)}
      style={noteLayoutStyle({ variant, fullWidth })}
      role="note"
      aria-label={t('free_slot_aria', {
        duration,
        start: timeToString(start),
        end: timeToString(end),
      })}
    >
      <span
        className={cn(
          noteTextClass,
          canFitLesson ? 'text-[color:var(--xi-green-80)]' : 'text-text-disabled',
        )}
      >
        {label}
      </span>
    </div>
  );
};

export const ScheduleOverlapWarning = ({
  start,
  end,
  variant = 'card',
  fullWidth = false,
}: FeedNoteLayout & { start: Date; end: Date }) => {
  const { t } = useTranslation('calendar');
  const label = t('overlap_warning');

  return (
    <div
      className={noteLayoutClass(variant)}
      style={noteLayoutStyle({ variant, fullWidth })}
      role="status"
      aria-label={t('overlap_warning_aria', {
        start: timeToString(start),
        end: timeToString(end),
      })}
    >
      <InfoCircle className="size-3 shrink-0 fill-[var(--xi-red-80)]" />
      <span className={cn(noteTextClass, 'text-[color:var(--xi-red-80)]')}>{label}</span>
    </div>
  );
};

export const ScheduleFeedNote = ({ entry, variant, fullWidth }: ScheduleFeedNoteProps) => {
  if (entry.kind === 'overlap') {
    return (
      <ScheduleOverlapWarning
        start={entry.start}
        end={entry.end}
        variant={variant}
        fullWidth={fullWidth}
      />
    );
  }

  return (
    <ScheduleFreeSlot start={entry.start} end={entry.end} variant={variant} fullWidth={fullWidth} />
  );
};
