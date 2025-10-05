// import { Badge } from '@xipkg/badge';
import { useParams } from '@tanstack/react-router';
import { useGetClassroom, useGroupStudentsList } from 'common.services';
import { OverviewSkeleton } from './OverviewSkeleton';
import { SectionContainer } from './SectionContainer';
import { MaterialsList } from './MaterialsLIst';
import { PaymentsList } from './PaymentsList';
import { StudentsList } from './StudentsList';

export const Overview = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));
  const {
    data: groupStudents,
    isLoading: isLoadingGroupStudents,
    isError: isErrorGroupStudents,
    refetch,
  } = useGroupStudentsList(classroomId);

  if (isLoading && isLoadingGroupStudents) {
    return <OverviewSkeleton numberOfSections={3} />;
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
      {/* <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xl-base font-medium text-gray-100">Занятия</h2>
          <Button
            variant="ghost"
            className="flex size-8 items-center justify-center rounded-[4px] p-0"
            onClick={() => handleTabChange('lessons')}
          >
            <ArrowRight className="fill-gray-60 size-6" />
          </Button>
        </div>
        <div className="flex flex-row">
          <ScrollArea
            className="h-[186px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8">
              {[...new Array(10)].map((_, index) => (
                <div
                  key={index}
                  className="border-gray-60 flex min-h-[172px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4"
                >
                  <Badge variant="success" size="s">
                    Оплачено
                  </Badge>
                  <h3 className="text-l-base font-medium text-gray-100">Past simple</h3>
                  <div className="flex flex-row items-center justify-start gap-2">
                    <span className="text-s-base text-gray-80 font-medium">
                      Сегодня, 12:00–12:40
                    </span>
                    <span className="text-xs-base text-gray-60 font-medium">40 минут</span>
                  </div>
                  <Button
                    variant="secondary"
                    className="bg-brand-0 text-brand-100 hover:text-brand-80 hover:bg-brand-10 mt-auto h-8 self-end rounded-lg border-none"
                  >
                    Начать занятие
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div> */}
      <SectionContainer title="Материалы" tabLink="materials">
        <MaterialsList />
      </SectionContainer>
      <SectionContainer title="Оплаты" tabLink="payments">
        <PaymentsList />
      </SectionContainer>
      {classroom.kind === 'group' && (
        <SectionContainer title="Ученики" tabLink="">
          <StudentsList
            students={groupStudents}
            classroomId={classroomId}
            isError={isErrorGroupStudents}
            onRetry={refetch}
          />
        </SectionContainer>
      )}
    </div>
  );
};
