/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy } from 'react';

// Динамический импорт для страницы классных комнат
const ClassroomsPage = lazy(() =>
  import('pages.classrooms').then((module) => ({ default: module.ClassroomsPage })),
);

const Classrooms = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ClassroomsPage />
    </Suspense>
  );
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
