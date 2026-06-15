/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { z } from 'zod';

const ClassroomPage = lazy(() =>
  import('pages.classroom').then((module) => ({ default: module.ClassroomPage })),
);

const paramsSchema = z.object({
  classroomId: z.string(),
});

const searchSchema = z.object({
  tab: z.string().optional(),
  call: z.string().optional(),
  /** ISO-дата — перейти на неделю расписания, содержащую этот момент (вместе с `tab=schedule`). */
  focused_at: z.string().optional(),
  /** Persisted инстанс — открыть карточку занятия; дата недели берётся из ответа деталей (`starts_at`). */
  event_instance_id: z.string().optional(),
  /** Повторяющийся виртуальный инстанс — открыть карточку занятия серии */
  repetition_mode_id: z.string().optional(),
  instance_index: z.coerce.number().optional(),
  /** Служебный токен повторного диплинка из уведомления */
  schedule_dl: z.string().optional(),
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/classrooms/$classroomId/')({
  component: ClassroomPageComponent,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  beforeLoad: () => {
    // console.log('Classroom', context, location);
  },
});

function ClassroomPageComponent() {
  return (
    <>
      <ClassroomPage />
    </>
  );
}
