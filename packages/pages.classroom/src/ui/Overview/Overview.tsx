// import { Badge } from '@xipkg/badge';
import { useParams } from '@tanstack/react-router';
import { useGetClassroom, useCurrentUser } from 'common.services';
import { OverviewSkeleton } from './OverviewSkeleton';
import { SectionContainer } from './SectionContainer';
import { MaterialsList } from './MaterialsList';
import { PaymentsList } from './PaymentsList';
import { StudentsList } from './StudentsList';

export const Overview = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));

  if (isLoading) {
    return <OverviewSkeleton numberOfSections={2} />;
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-medium text-gray-900">Ошибка загрузки данных</h2>
        <p className="text-gray-600">Не удалось загрузить информацию о кабинете</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <SectionContainer title="Материалы" tabLink="materials">
        <MaterialsList />
      </SectionContainer>
      <SectionContainer title="Оплаты" tabLink="payments">
        <PaymentsList />
      </SectionContainer>
      {classroom.kind === 'group' && isTutor && (
        <SectionContainer title="Ученики" tabLink="">
          <StudentsList classroomId={classroomId} />
        </SectionContainer>
      )}
    </div>
  );
};
