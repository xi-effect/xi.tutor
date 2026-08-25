import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomTutorPaymentsList,
  useGetClassroomStudentPaymentsList,
  useGetClassroom,
} from 'common.services';
import { InvoiceCard } from 'features.invoice.card';
import { EmptyPayments } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { PaymentsListSkeleton } from './PaymentsListSkeleton';
import { SectionEmptyState } from '../SectionEmptyState';
import { sectionEmptyStateIllustrationClass } from '../sectionEmptyStateIllustrationClass';
import { WidgetCardsCarousel, widgetCardSlotClass } from '../WidgetCardsCarousel';
import { galleryInvoiceCardClass } from '../galleryShadowClass';

export const PaymentsList = () => {
  const { t } = useTranslation('classroom');
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const roleReady = !isUserLoading && user != null;

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: classroom } = useGetClassroom(Number(classroomId));

  const { data: studentPayments, isLoading: isLoadingStudent } = useGetClassroomStudentPaymentsList(
    {
      classroomId,
      disabled: !roleReady || isTutor,
    },
  );
  const { data: tutorPayments, isLoading: isLoadingTutor } = useGetClassroomTutorPaymentsList({
    classroomId,
    disabled: !roleReady || !isTutor,
  });

  const payments = isTutor ? tutorPayments : studentPayments;
  const isLoading = !roleReady || (isTutor ? isLoadingTutor : isLoadingStudent);

  if (isLoading) {
    return (
      <WidgetCardsCarousel>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={widgetCardSlotClass}>
            <PaymentsListSkeleton />
          </div>
        ))}
      </WidgetCardsCarousel>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <SectionEmptyState
        title={t('overview.paymentsEmpty')}
        description={t('overview.paymentsEmptyDescription')}
        minHeightClass="min-h-[160px]"
        illustration={<EmptyPayments className={sectionEmptyStateIllustrationClass} />}
      />
    );
  }

  return (
    <WidgetCardsCarousel>
      {payments.map((payment) => (
        <div key={payment.id} className={widgetCardSlotClass}>
          <InvoiceCard
            className={galleryInvoiceCardClass}
            payment={payment}
            currentUserRole={isTutor ? 'tutor' : 'student'}
            type={classroom?.kind === 'group' && isTutor ? 'full' : 'short'}
            withoutPaymentType
          />
        </div>
      ))}
    </WidgetCardsCarousel>
  );
};
