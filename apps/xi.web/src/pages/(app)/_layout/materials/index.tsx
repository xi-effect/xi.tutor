/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { MaterialsPage } from 'pages.materials';

const Materials = () => {
  return <MaterialsPage />;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/materials/')({
  component: Materials,
  beforeLoad: ({ context, location }) => {
    console.log('Materials', context, location);
  },
});
