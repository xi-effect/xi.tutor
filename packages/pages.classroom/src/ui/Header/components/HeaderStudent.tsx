import { useParams } from '@tanstack/react-router';
import { useGetClassroomStudent } from 'common.services';
import { Content } from './Content';
import { Error } from './Error';
import { Skeleton } from './Skeleton';

export const HeaderStudent = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroomStudent(Number(classroomId));

  console.log('classroom', classroom);

  if (isLoading) {
    return <Skeleton />;
  }

  if (isError || !classroom) {
    return <Error />;
  }

  return <Content classroom={classroom} />;
};
