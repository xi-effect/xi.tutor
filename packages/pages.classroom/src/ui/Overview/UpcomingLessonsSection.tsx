import { useMemo, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Add } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { ScrollArea } from '@xipkg/scrollarea';
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
import { useClassroomSchedule } from '../Calendar/ClassroomScheduleContext';
import { UpcomingLessonCard } from './UpcomingLessonCard';
import { UpcomingLessonCardSkeleton } from './UpcomingLessonCardSkeleton';

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
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { onAddLessonClick } = useClassroomSchedule();
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
        <div className="flex flex-row items-center justify-between gap-2 pr-0 sm:pr-0">
          <h2 className="text-xl-base text-gray-100 first-letter:uppercase">Ближайшие занятия</h2>
          <div className="flex items-center gap-1">
            {isTutor ? (
              <Button
                type="button"
                variant="none"
                className="bg-brand-0 hover:bg-brand-20/50 active:bg-brand-20/50 flex h-8 w-10 items-center justify-center rounded-lg p-0"
                onClick={() => onAddLessonClick?.()}
                aria-label="Добавить занятие"
              >
                <Add className="fill-brand-80 size-6" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-row">
          {isLoading ? (
            <ScrollArea
              className="min-h-[220px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
              scrollBarProps={{ orientation: 'horizontal' }}
            >
              <div className="flex min-h-[220px] w-max flex-row items-stretch gap-4 pr-1 pb-4">
                <UpcomingLessonCardSkeleton />
                <UpcomingLessonCardSkeleton />
                <UpcomingLessonCardSkeleton />
              </div>
            </ScrollArea>
          ) : lessons.length === 0 ? (
            <div className="border-gray-10 bg-gray-0 dark:border-gray-70 box-border flex min-h-[232px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-4">
              <EmptySchedule
                className="max-h-[124px] w-full max-w-[320px] shrink-0 object-contain"
                aria-hidden
              />
              <div className="flex max-w-[520px] flex-col gap-2 text-center">
                <p className="text-m-base font-semibold text-gray-100">
                  В ближайшие 7 дней занятий нет
                </p>
                <p className="text-s-base text-gray-60 dark:text-gray-50">
                  Когда уроки появятся в расписании кабинета, они отобразятся здесь
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea
              className="min-h-[220px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
              scrollBarProps={{ orientation: 'horizontal' }}
            >
              <div className="flex min-h-[220px] w-max flex-row items-stretch gap-4 pr-1 pb-4">
                {lessons.map(({ lesson, item }, index) => (
                  <UpcomingLessonCard
                    key={`${lesson.classroomId}-${lesson.startAt?.toISOString()}`}
                    lesson={lesson}
                    classroomId={classroomId}
                    isNearest={index === 0}
                    showActions={isTutor}
                    onReschedule={() => setMoveItem(item)}
                    onEdit={() => setEditItem(item)}
                    onDelete={() => setDeleteItem(item)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
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
