import { cn, useMediaQuery } from '@xipkg/utils';
import { useParams } from '@tanstack/react-router';
import { useCurrentUser, useGetClassroom, useGetClassroomStudent } from 'common.services';
import { NotFoundPage } from 'common.ui';
import { Header } from './Header';
import { Tabs } from './Tabs';
import { ClassroomScheduleRoot } from './Calendar/ClassroomScheduleRoot';

export const ClassroomPage = () => {
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { classroomId } = useParams({ strict: false });
  const classroomIdNum = Number(classroomId);
  const hasValidId = Number.isFinite(classroomIdNum) && classroomIdNum > 0;

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const tutorQuery = useGetClassroom(classroomIdNum, isUserLoading || !isTutor || !hasValidId);
  const studentQuery = useGetClassroomStudent(
    classroomIdNum,
    isUserLoading || isTutor || !hasValidId,
  );
  const classroomQuery = isTutor ? tutorQuery : studentQuery;

  if (!hasValidId || classroomQuery.isError || (classroomQuery.isFetched && !classroomQuery.data)) {
    return <NotFoundPage withLogo={false} />;
  }

  return (
    <ClassroomScheduleRoot>
      <div
        className={cn(
          'bg-background-page flex flex-col gap-4',
          isMobile ? 'h-full min-h-0 overflow-hidden' : 'h-screen',
        )}
      >
        <Header />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Tabs />
        </div>
      </div>
    </ClassroomScheduleRoot>
  );
};
