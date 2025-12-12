import { useMemo, useRef } from 'react';
import { useInfiniteQuery, createPaymentColumns } from 'features.table';
import { VirtualizedPaymentsTable } from 'pages.payments';
import { useMediaQuery } from '@xipkg/utils';
import { useParams } from '@tanstack/react-router';
import { useGetClassroom, useCurrentUser } from 'common.services';

export const Payments = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: classroom } = useGetClassroom(Number(classroomId));
  const isMobile = useMediaQuery('(max-width: 719px)');

  const parentRef = useRef<HTMLDivElement>(null);

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const currentUserRole = isTutor ? 'tutor' : 'student';

  const { items, isLoading, isFetchingNextPage, isError } = useInfiniteQuery(
    parentRef,
    currentUserRole,
    classroomId,
  );

  const defaultColumns = useMemo(
    () =>
      createPaymentColumns({
        withStudentColumn: false,
        usersRole: isTutor ? 'student' : 'tutor',
        isMobile,
        isTutor,
      }),
    [isMobile, isTutor],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-medium text-gray-900">Ошибка загрузки данных</h2>
        <p className="text-gray-600">Не удалось загрузить платежи кабинета</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <VirtualizedPaymentsTable
        data={items}
        columns={defaultColumns}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        parentRef={parentRef}
        isError={isError}
        currentUserRole={currentUserRole}
      />
    </div>
  );
};
