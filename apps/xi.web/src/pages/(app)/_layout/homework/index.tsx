/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { HomeworkPage } from 'pages.homework';
import { z } from 'zod';

const searchSchema = z
  .object({
    tab: z.enum(['active', 'templates', 'archive']).optional(),
    role: z.enum(['tutor', 'student']).optional(),
    read_notification_id: z.string().optional(),
  })
  .passthrough();

const Homework = () => {
  return <HomeworkPage />;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/homework/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Домашние задания',
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  component: Homework,
});
