/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy } from 'react';

// Динамический импорт для главной страницы
const MainPage = lazy(() => import('pages.main').then((module) => ({ default: module.MainPage })));

const Main = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <MainPage />
    </Suspense>
  );
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Главная',
      },
    ],
  }),
  beforeLoad: ({ context, location }) => {
    console.log('IndexRoute', context, location);
  },
  component: Main,
});
