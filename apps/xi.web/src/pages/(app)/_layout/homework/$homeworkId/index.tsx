/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { HomeworkEditorPage } from 'pages.homework';

const HomeworkEditorRoute = () => {
  return <HomeworkEditorPage />;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/homework/$homeworkId/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Домашнее задание',
      },
    ],
  }),
  component: HomeworkEditorRoute,
});
