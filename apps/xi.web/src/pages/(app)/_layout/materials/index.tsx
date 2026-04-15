/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { MaterialsPage } from 'pages.materials';
import { z } from 'zod';

const searchSchema = z.object({
  tab: z.enum(['boards', 'notes']).optional(),
});

const Materials = () => {
  return <MaterialsPage />;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/materials/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Материалы',
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  component: Materials,
});
