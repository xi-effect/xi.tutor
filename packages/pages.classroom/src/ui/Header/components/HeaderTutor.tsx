import { useParams } from '@tanstack/react-router';
import { useGetClassroom } from 'common.services';
import { Content } from './Content';
import { Error } from './Error';
import { Skeleton } from './Skeleton';

export const HeaderTutor = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));

  if (isLoading) {
    return <Skeleton />;
  }

  if (isError || !classroom) {
    return <Error />;
  }

  return <Content classroom={classroom} />;
};
