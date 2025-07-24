/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { MainPage } from 'pages.main';

const Main = () => {
  return <MainPage />;
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
