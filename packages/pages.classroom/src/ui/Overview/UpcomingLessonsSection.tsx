import { useMemo, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Add } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { useCurrentUser } from 'common.services';
import {
  useTutorClassroomSchedule,
  useStudentClassroomSchedule,
  useUpdateClassroomEvent,
  type ScheduleItem,
} from 'modules.calendar';
import type { ChangeLessonFormData } from 'features.lesson.change';
import { ChangeLessonModal } from 'features.lesson.change';
import type { ScheduleLessonRow } from 'modules.calendar';
import { EmptySchedule } from 'common.ui';
import {
  MovingLessonModal,
  type RepeatedVirtualRescheduleTarget,
  type SoleRescheduleTarget,
} from 'features.lesson.move';
import { CancelLessonModal, type LessonSchedulerMetaForCancel } from 'features.lesson.cancel';
import { useTranslation } from 'react-i18next';
import { useClassroomScheduleOptional } from '../Calendar/scheduleContext';
import { UpcomingLessonCard } from './UpcomingLessonCard';
import { UpcomingLessonCardSkeleton } from './UpcomingLessonCardSkeleton';
import { SectionHeader } from './SectionHeader';
import { SectionEmptyState } from '../SectionEmptyState';
import { sectionEmptyStateIllustrationClass } from '../sectionEmptyStateIllustrationClass';
import { WidgetCardsCarousel } from '../WidgetCardsCarousel';
import {
  emptyInviteButtonClass,
  galleryShadowHeaderInsetClass,
  primaryIconButtonClass,
} from '../galleryShadowClass';

function getUpcomingRange() {
  const now = new Date();
  const happensAfter = now.toISOString();
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  const happensBefore = end.toISOString();
  return { happensAfter, happensBefore };
}

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

type UpcomingLessonViewModel = {
  lesson: ScheduleLessonRow;
  item: ScheduleItem;
};

function scheduleItemToLesson(item: ScheduleItem): ScheduleLessonRow {
  const startDate = new Date(item.startsAt);
  const endDate = new Date(item.endsAt);
  return {
    id: item.eventId,
    classroomId: item.classroomId ?? undefined,
    startAt: startDate,
    startTime: formatTime(startDate),
    endTime: formatTime(endDate),
    subject: item.title,
    description: item.description ?? undefined,
    studentName: '',
    studentId: 0,
  };
}

function toCancelMeta(item: ScheduleItem): LessonSchedulerMetaForCancel {
  const instance = item.eventInstance;
  const eventInstanceId = 'id' in instance ? instance.id : undefined;
  const repetitionModeId =
    'repetition_mode_id' in instance ? instance.repetition_mode_id : undefined;
  const instanceIndex = 'instance_index' in instance ? instance.instance_index : undefined;
  return {
    eventId: item.eventId,
    startsAt: item.startsAt,
    instanceKind: item.instanceKind,
    eventInstanceId,
    repetitionModeId,
    instanceIndex,
  };
}

function formatTimeHm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function jsWeekdayToSeriesIndex(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function getSchedulerTarget(
  item: ScheduleItem,
  classroomId: number,
): RepeatedVirtualRescheduleTarget | undefined {
  if (item.instanceKind !== 'repeated_virtual') return undefined;
  const instance = item.eventInstance;
  if (!('repetition_mode_id' in instance) || !('instance_index' in instance)) return undefined;
  return {
    classroomId,
    eventId: item.eventId,
    repetitionModeId: instance.repetition_mode_id,
    instanceIndex: instance.instance_index,
  };
}

function getSoleTarget(item: ScheduleItem, classroomId: number): SoleRescheduleTarget | undefined {
  if (item.instanceKind === 'repeated_virtual') return undefined;
  const instance = item.eventInstance;
  if (!('id' in instance)) return undefined;
  return { classroomId, eventInstanceId: instance.id };
}

export const UpcomingLessonsSection = () => {
  const { t } = useTranslation('classroom');
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const scheduleCtx = useClassroomScheduleOptional();
  const onAddLessonClick = scheduleCtx?.onAddLessonClick;
  const { classroomId: classroomIdParam } = useParams({
    from: '/(app)/_layout/classrooms/$classroomId/',
  });
  const classroomId = Number(classroomIdParam);

  const range = useMemo(() => getUpcomingRange(), []);

  const tutorScheduleQuery = useTutorClassroomSchedule({
    classroomId,
    ...range,
    enabled: !isUserLoading && isTutor === true,
  });

  const studentScheduleQuery = useStudentClassroomSchedule({
    classroomId,
    ...range,
    enabled: !isUserLoading && isTutor === false,
  });

  const scheduleQuery = isTutor ? tutorScheduleQuery : studentScheduleQuery;
  const isLoading = isUserLoading || scheduleQuery.isLoading;
  const updateClassroomEvent = useUpdateClassroomEvent();
  const [moveItem, setMoveItem] = useState<ScheduleItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ScheduleItem | null>(null);
  const [editItem, setEditItem] = useState<ScheduleItem | null>(null);

  const lessons = useMemo<UpcomingLessonViewModel[]>(() => {
    if (!scheduleQuery.data) return [];
    return scheduleQuery.data
      .filter((item) => item.cancelledAt == null)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .map((item) => ({
        item,
        lesson: scheduleItemToLesson(item),
      }));
  }, [scheduleQuery.data]);

  const handleEditSave = (data: ChangeLessonFormData) => {
    if (editItem == null || !isTutor) return;
    const description = data.description?.trim() ?? '';
    updateClassroomEvent.mutate({
      classroomId,
      eventId: editItem.eventId,
      body: {
        name: data.title.trim(),
        description: description === '' ? null : description,
      },
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className={galleryShadowHeaderInsetClass}>
          <SectionHeader
            title={t('overview.upcomingLessons')}
            tabLink="schedule"
            actions={
              isTutor ? (
                <Button
                  type="button"
                  variant="primary"
                  className={primaryIconButtonClass}
                  onClick={() => onAddLessonClick?.()}
                  aria-label={t('actions.addLesson')}
                >
                  <Add className="fill-text-on-accent size-6" />
                </Button>
              ) : null
            }
          />
        </div>

        {isLoading ? (
          <WidgetCardsCarousel>
            <UpcomingLessonCardSkeleton />
            <UpcomingLessonCardSkeleton />
            <UpcomingLessonCardSkeleton />
          </WidgetCardsCarousel>
        ) : lessons.length === 0 ? (
          <SectionEmptyState
            title={t('overview.noLessonsTitle')}
            description={t('overview.noLessonsDescription')}
            minHeightClass="min-h-[160px] sm:min-h-[180px]"
            illustration={
              <EmptySchedule className={sectionEmptyStateIllustrationClass} aria-hidden />
            }
            actions={
              isTutor ? (
                <Button
                  type="button"
                  variant="none"
                  className={emptyInviteButtonClass}
                  onClick={() => onAddLessonClick?.()}
                  data-umami-event="classroom-overview-empty-add-lesson"
                >
                  {t('actions.addLesson')}
                  <Add className="fill-icon-brand size-4 shrink-0" />
                </Button>
              ) : undefined
            }
          />
        ) : (
          <WidgetCardsCarousel>
            {lessons.map(({ lesson, item }, index) => (
              <div key={`${lesson.id}`} className="flex w-[300px] shrink-0 flex-col sm:w-[320px]">
                <UpcomingLessonCard
                  lesson={lesson}
                  classroomId={classroomId}
                  isNearest={index === 0}
                  showActions={isTutor}
                  onReschedule={() => setMoveItem(item)}
                  onEdit={() => setEditItem(item)}
                  onDelete={() => setDeleteItem(item)}
                />
              </div>
            ))}
          </WidgetCardsCarousel>
        )}
      </div>
      {moveItem != null ? (
        <MovingLessonModal
          open
          onOpenChange={(open) => {
            if (!open) setMoveItem(null);
          }}
          formKey={`${moveItem.eventId}-${moveItem.startsAt}`}
          lessonKind={moveItem.instanceKind === 'repeated_virtual' ? 'recurring' : 'one-off'}
          initialDate={new Date(moveItem.startsAt)}
          initialStartTime={formatTimeHm(new Date(moveItem.startsAt))}
          initialEndTime={formatTimeHm(new Date(moveItem.endsAt))}
          classroomId={moveItem.classroomId ?? undefined}
          fallbackName={moveItem.title}
          lessonTitle={moveItem.title}
          lessonDescription={moveItem.description ?? undefined}
          seriesWeekdayIndex={jsWeekdayToSeriesIndex(new Date(moveItem.startsAt))}
          weeklyBitmask={
            moveItem.repetitionMode?.kind === 'weekly'
              ? (moveItem.repetitionMode.weekly_starting_bitmask ?? undefined)
              : undefined
          }
          repetitionKind={moveItem.repetitionKind}
          schedulerTarget={getSchedulerTarget(moveItem, classroomId)}
          soleTarget={getSoleTarget(moveItem, classroomId)}
        />
      ) : null}
      {deleteItem != null ? (
        <CancelLessonModal
          open
          onOpenChange={(open) => {
            if (!open) setDeleteItem(null);
          }}
          classroomId={classroomId}
          schedulerMeta={toCancelMeta(deleteItem)}
          onSuccess={() => setDeleteItem(null)}
        />
      ) : null}
      {editItem != null && isTutor ? (
        <ChangeLessonModal
          open
          onOpenChange={(open) => {
            if (!open) setEditItem(null);
          }}
          hideClassroomAndSubject
          classroomName=""
          defaultTitle={editItem.title}
          defaultDescription={editItem.description ?? ''}
          onSave={handleEditSave}
        />
      ) : null}
    </>
  );
};
