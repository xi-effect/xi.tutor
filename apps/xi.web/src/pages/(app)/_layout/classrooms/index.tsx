/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

const Classrooms = () => {
  return <>Classrooms</>;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/classrooms/')({
  component: Classrooms,
  beforeLoad: ({ context, location }) => {
    console.log('Classrooms', context, location);
  },
});
