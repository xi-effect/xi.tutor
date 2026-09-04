import { useNavigate, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { getDateLocale } from 'common.ui';
import type { ScheduleItem } from 'modules.calendar';
import { useNextClassroomLesson } from './useNextClassroomLesson';

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatNextLessonLabel(
  item: ScheduleItem,
  locale: string,
  t: (key: string, options?: Record<string, string>) => string,
) {
  const startsAt = new Date(item.startsAt);
  const endsAt = new Date(item.endsAt);
  const start = formatTime(startsAt);
  const end = formatTime(endsAt);
  const diffDays = Math.round(
    (startOfLocalDay(startsAt) - startOfLocalDay(new Date())) / 86_400_000,
  );

  if (diffDays === 0) return t('header.nextLessonToday', { start, end });
  if (diffDays === 1) return t('header.nextLessonTomorrow', { start, end });

  const date = startsAt.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  return t('header.nextLessonOnDate', { date, start, end });
}

export const NextLessonChip = () => {
  const { t, i18n } = useTranslation('classroom');
  const navigate = useNavigate();
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { item, isLoading } = useNextClassroomLesson();

  if (isLoading || item == null) return null;

  const label = formatNextLessonLabel(item, getDateLocale(i18n.language), t);

  const handleClick = () => {
    const instance = item.eventInstance;

    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId },
      search: (prev: Record<string, unknown>) => {
        const next: Record<string, unknown> = {
          ...prev,
          tab: 'schedule',
          focused_at: item.startsAt,
        };

        if ('id' in instance && instance.id != null) {
          next.event_instance_id = String(instance.id);
          delete next.repetition_mode_id;
          delete next.instance_index;
        } else if ('repetition_mode_id' in instance) {
          next.repetition_mode_id = String(instance.repetition_mode_id);
          if ('instance_index' in instance && instance.instance_index != null) {
            next.instance_index = String(instance.instance_index);
          }
          delete next.event_instance_id;
        }

        return next;
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="hover:bg-background-subtle flex h-10 min-w-0 flex-col items-start justify-center rounded-[10px] px-3 text-left"
      data-umami-event="classroom-header-next-lesson"
    >
      <span className="text-xs-base text-text-secondary leading-4">{t('header.nextLesson')}</span>
      <span className="text-s-base text-text-primary truncate leading-4 font-medium">{label}</span>
    </button>
  );
};
