// import { Badge } from '@xipkg/badge';
import { useParams } from '@tanstack/react-router';
import { useGetClassroom, useCurrentUser } from 'common.services';
import { useTranslation } from 'react-i18next';
import { OverviewSkeleton } from './OverviewSkeleton';
import { SectionContainer } from './SectionContainer';
import { MaterialsList } from './MaterialsList';
import { PaymentsList } from './PaymentsList';
import { StudentsList } from './StudentsList';
import { UpcomingLessonsSection } from './UpcomingLessonsSection';

export const Overview = () => {
  const { t } = useTranslation('classroom');
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
        <h2 className="text-text-primary text-xl font-medium">{t('errors.loadData')}</h2>
        <p className="text-text-primary">{t('errors.classroomInfo')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-2">
      <UpcomingLessonsSection />
      <SectionContainer title={t('overview.materials')} tabLink="materials">
        <MaterialsList />
      </SectionContainer>
      <SectionContainer title={t('overview.payments')} tabLink="payments">
        <PaymentsList />
      </SectionContainer>
      {classroom.kind === 'group' && isTutor && (
        <SectionContainer title={t('overview.students')} tabLink="">
          <StudentsList classroomId={classroomId} />
        </SectionContainer>
      )}
    </div>
  );
};
