import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomTutorPaymentsList,
  useGetClassroomStudentPaymentsList,
} from 'common.services';
import { Payment } from './Payment';

export const PaymentsList = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });

  const { data: studentPayments, isLoading: isLoadingStudent } = useGetClassroomStudentPaymentsList(
    {
      classroomId,
      disabled: isTutor,
    },
  );
  const { data: tutorPayments, isLoading: isLoadingTutor } = useGetClassroomTutorPaymentsList({
    classroomId,
    disabled: !isTutor,
  });

  const payments = isTutor ? tutorPayments : studentPayments;
  const isLoading = isTutor ? isLoadingTutor : isLoadingStudent;

  if (isLoading) {
    return (
      <div className="flex flex-row gap-8">
        <p className="text-m-base text-gray-60">Загрузка...</p>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="flex h-[148px] w-full flex-row items-center justify-center gap-8">
        <p className="text-m-base text-gray-60">Здесь пока пусто</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-8 pb-4">
      {payments.map((payment) => (
        <Payment
          key={payment.id}
          payment={payment}
          currentUserRole={isTutor ? 'tutor' : 'student'}
        />
      ))}
    </div>
  );
};
