/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { ClassroomsPage } from 'pages.classrooms';

const Classrooms = () => {
  return <ClassroomsPage />;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/classrooms/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Кабинеты',
      },
    ],
  }),
  component: Classrooms,
  beforeLoad: ({ context, location }) => {
    console.log('Classrooms', context, location);
  },
});
