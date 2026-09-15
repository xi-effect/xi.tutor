import { useMemo } from 'react';
import { DayLessonRow } from '../DayLessonRow';
import { ScheduleFeedNote } from '../ScheduleFreeSlot';
import type { ChangeLessonFormData } from 'features.lesson.change';
import type { ScheduleLessonRow } from '../../types';
import { interleaveLessonRowsWithFreeTimeGaps } from '../../../utils/interleaveWithFreeTimeGaps';

type DayLessonFeedProps = {
  lessons: ScheduleLessonRow[];
  dayDate: Date;
  nearestIndex: number;
  variant?: 'list' | 'card';
  appearance?: 'elevated' | 'muted';
  showActions?: boolean;
  onReschedule?: (lesson: ScheduleLessonRow) => void;
  onSaveLesson?: (lesson: ScheduleLessonRow, data: ChangeLessonFormData) => void;
};

export const DayLessonFeed = ({
  lessons,
  dayDate,
  nearestIndex,
  variant = 'list',
  appearance = 'elevated',
  showActions,
  onReschedule,
  onSaveLesson,
}: DayLessonFeedProps) => {
  const feed = useMemo(
    () => interleaveLessonRowsWithFreeTimeGaps(lessons, dayDate),
    [lessons, dayDate],
  );

  return (
    <>
      {feed.map((entry, entryIndex) => {
        if (entry.kind === 'gap' || entry.kind === 'overlap') {
          return (
            <ScheduleFeedNote
              key={`${entry.kind}-${entry.start.getTime()}-${entry.end.getTime()}-${entryIndex}`}
              entry={entry}
              variant={variant === 'card' ? 'card' : 'list'}
              fullWidth={variant === 'card'}
            />
          );
        }

        return (
          <DayLessonRow
            key={`${entry.item.id}-${entry.item.startAt?.toISOString() ?? entry.item.startTime}`}
            lesson={entry.item}
            lessonDay={dayDate}
            variant={variant}
            appearance={appearance}
            showActions={showActions}
            isNearestLesson={nearestIndex >= 0 && entry.index === nearestIndex}
            onReschedule={onReschedule}
            onSaveLesson={onSaveLesson}
          />
        );
      })}
    </>
  );
};
