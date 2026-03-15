import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { Add, ArrowUpRight, Card, Check, Clock } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Badge } from '@xipkg/badge';
import {
  useCurrentUser,
  useGetTutorPaymentsList,
  useGetStudentPaymentsList,
  useUserByRole,
  getStatusColor,
} from 'common.services';
import { mapPaymentStatus, PaymentStatusT, RolePaymentT } from 'common.types';
import { cn } from '@xipkg/utils';
import { InvoiceModal } from 'features.invoice';
import { useState } from 'react';

const PAYMENTS_PREVIEW_LIMIT = 10;

const statusIcons: Record<PaymentStatusT, React.ReactNode> = {
  wf_receiver_confirmation: <Clock className="fill-brand-80 size-4 shrink-0" />,
  wf_sender_confirmation: <Card className="fill-orange-80 size-4 shrink-0" />,
  complete: <Check className="fill-green-80 size-4 shrink-0" />,
};

type PaymentCardProps = {
  payment: RolePaymentT<'tutor'> | RolePaymentT<'student'>;
  currentUserRole: 'tutor' | 'student';
};

const PaymentCard = ({ payment, currentUserRole }: PaymentCardProps) => {
  const userId =
    currentUserRole === 'tutor'
      ? (payment as { student_id: number }).student_id
      : (payment as { tutor_id: number }).tutor_id;
  const userRole = currentUserRole === 'tutor' ? 'student' : 'tutor';
  const { data: user } = useUserByRole(userRole, userId);

  const amount = parseFloat(payment.total);
  const statusText = mapPaymentStatus[payment.status];
  const StatusIcon = statusIcons[payment.status];

  return (
    <div className="border-gray-30 flex min-h-[120px] max-w-[280px] min-w-[280px] shrink-0 flex-col justify-between gap-3 rounded-2xl border bg-transparent px-4 py-3">
      <Badge
        className={cn(
          'text-m-base inline-flex w-fit items-center gap-1.5 font-normal',
          getStatusColor(payment.status, true),
        )}
      >
        {StatusIcon}
        {statusText}
      </Badge>
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex min-w-0 flex-row items-center gap-2">
          <Avatar size="m">
            <AvatarImage src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`} alt="" />
            <AvatarFallback size="m">
              {user?.display_name?.[0]?.toUpperCase() ?? user?.username?.[0] ?? '?'}
            </AvatarFallback>
          </Avatar>
          <span className="text-s-base truncate font-medium text-gray-100">
            {user?.display_name || user?.username || '—'}
          </span>
        </div>
        <span className="text-s-base shrink-0 font-medium text-gray-100">{amount} ₽</span>
      </div>
    </div>
  );
};

export const Payments = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { data: tutorPayments, isLoading: isLoadingTutor } = useGetTutorPaymentsList({
    disabled: !isTutor,
  });
  const { data: studentPayments, isLoading: isLoadingStudent } = useGetStudentPaymentsList({
    disabled: isTutor,
  });

  const payments = isTutor ? tutorPayments : studentPayments;
  const isLoading = isTutor ? isLoadingTutor : isLoadingStudent;
  const previewList = (payments ?? []).slice(0, PAYMENTS_PREVIEW_LIMIT);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const handleMore = () => {
    const filteredSearch = search.call ? { call: search.call } : {};
    navigate({
      to: '/payments',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...filteredSearch,
      }),
    });
  };

  const handleAdd = () => {
    setInvoiceModalOpen(true);
  };

  return (
    <div className="bg-gray-0 flex w-[calc(100vw-var(--sidebar-width)-var(--lessons-panel-width)-48px)] flex-col gap-4 rounded-2xl p-4 transition-all duration-200 ease-linear">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-l-base font-medium text-gray-100">Оплата</h2>
        <Button
          variant="none"
          className="bg-brand-0 hover:bg-brand-20/50 active:bg-brand-20/50 flex h-8 w-10 items-center justify-center rounded-lg p-0"
          onClick={handleAdd}
          data-umami-event="create-invoice-button"
          id="create-invoice-button"
        >
          <Add className="fill-brand-80 size-6" />
        </Button>
        <InvoiceModal open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen} />
      </div>

      {isLoading ? (
        <div className="flex h-[120px] w-full items-center justify-center">
          <p className="text-m-base text-gray-60">Загрузка...</p>
        </div>
      ) : previewList.length > 0 ? (
        <ScrollArea
          // className="w-full"
          scrollBarProps={{ orientation: 'horizontal' }}
        >
          <div className="flex flex-row gap-3 pb-2">
            {previewList.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                currentUserRole={isTutor ? 'tutor' : 'student'}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex h-[120px] w-full flex-col items-center justify-center gap-2">
          <p className="text-m-base text-gray-60 text-center">Пока нет платежей</p>
          <Button
            variant="none"
            size="s"
            className="border-gray-30 rounded-lg border"
            onClick={handleMore}
          >
            Подробнее о финансах
            <ArrowUpRight className="ml-2 size-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
