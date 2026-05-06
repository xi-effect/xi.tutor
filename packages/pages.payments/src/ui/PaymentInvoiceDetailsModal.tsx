import { FC, useEffect } from 'react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { Alert, AlertContainer, AlertDescription, AlertIcon, AlertTitle } from '@xipkg/alert';
import { Close, InfoCircle } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';
import {
  useGetRecipientInvoiceByStudent,
  useGetRecipientInvoiceByTutor,
  useUserByRole,
} from 'common.services';
import { mapPaymentStatus, RolePaymentT } from 'common.types';
import { UserRoleT } from 'common.api';
import { getUserAvatarUrl } from 'common.utils';
import { formatDate } from '../utils';

type InvoiceItemT = {
  name: string;
  price: string;
  quantity: number;
};

type PaymentInvoiceDetailsT = {
  invoice: {
    created_at: string;
    comment: string | null;
  };
  recipient_invoice: {
    total: string;
    status: keyof typeof mapPaymentStatus;
    payment_type: 'cash' | 'transfer' | null;
  };
  invoice_items: InvoiceItemT[];
  student_id: number | null;
  tutor_id?: number | null;
};

type PaymentInvoiceDetailsModalPropsT = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentDetails: RolePaymentT<UserRoleT>;
  recipientInvoiceId: number;
  currentUserRole: UserRoleT;
};

const mapPaymentType: Record<'cash' | 'transfer', string> = {
  cash: 'Наличные',
  transfer: 'Перевод',
};

const getItemTotal = (price: string, quantity: number) => Number(price) * quantity;

const InvoiceItemsTable = ({ items }: { items: InvoiceItemT[] }) => {
  if (!items.length) {
    return <p className="text-gray-60 text-sm">Подробности по счёту отсутствуют.</p>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[560px]">
          <div className="text-gray-60 grid grid-cols-[minmax(200px,1fr)_100px_100px_120px] gap-4 border-b pb-3 text-sm">
            <p>Позиция</p>
            <p>Цена</p>
            <p>Количество</p>
            <p>Сумма</p>
          </div>
          <div className="divide-y">
            {items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="text-gray-80 grid grid-cols-[minmax(200px,1fr)_100px_100px_120px] gap-4 py-3 text-sm"
              >
                <p className="break-words">{item.name}</p>
                <p>{item.price} ₽</p>
                <p>{item.quantity}</p>
                <p>{getItemTotal(item.price, item.quantity)} ₽</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="border-gray-20 bg-gray-0 flex flex-col gap-2 rounded-2xl border p-3"
          >
            <p className="text-m-base text-gray-100">{item.name}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-60">Цена</p>
                <p className="text-gray-80">{item.price} ₽</p>
              </div>
              <div>
                <p className="text-gray-60">Количество</p>
                <p className="text-gray-80">{item.quantity}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-60">Сумма</p>
                <p className="text-gray-100">{getItemTotal(item.price, item.quantity)} ₽</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export const PaymentInvoiceDetailsModal: FC<PaymentInvoiceDetailsModalPropsT> = ({
  open,
  onOpenChange,
  paymentDetails,
  recipientInvoiceId,
  currentUserRole,
}) => {
  const isTutor = currentUserRole === 'tutor';
  const {
    data: dataByTutor,
    isLoading: isLoadingTutor,
    isError: isErrorTutor,
    refetch: refetchTutor,
  } = useGetRecipientInvoiceByTutor(recipientInvoiceId, !open || !isTutor || !recipientInvoiceId);
  const {
    data: dataByStudent,
    isLoading: isLoadingStudent,
    isError: isErrorStudent,
    refetch: refetchStudent,
  } = useGetRecipientInvoiceByStudent(recipientInvoiceId, !open || isTutor || !recipientInvoiceId);

  const data = (isTutor ? dataByTutor : dataByStudent) as PaymentInvoiceDetailsT | undefined;
  const isLoadingInvoice = isTutor ? isLoadingTutor : isLoadingStudent;
  const isErrorInvoice = isTutor ? isErrorTutor : isErrorStudent;
  const refetchInvoice = isTutor ? refetchTutor : refetchStudent;

  useEffect(() => {
    if (open && recipientInvoiceId && !data && !isLoadingInvoice && !isErrorInvoice) {
      refetchInvoice();
    }
  }, [open, recipientInvoiceId, data, isLoadingInvoice, isErrorInvoice, refetchInvoice]);

  const userId =
    'student_id' in paymentDetails ? paymentDetails.student_id : paymentDetails.tutor_id;
  const userRole = 'student_id' in paymentDetails ? 'student' : 'tutor';
  const { data: userData } = useUserByRole(userRole, userId);

  const invoiceComment = data?.invoice.comment?.trim();
  const paymentType = data?.recipient_invoice.payment_type;
  const paymentStatus = data?.recipient_invoice.status || paymentDetails.status;
  const totalAmount = data?.recipient_invoice.total || paymentDetails.total;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="relative flex max-h-[90dvh] w-[calc(100vw-32px)] max-w-[960px] flex-col overflow-y-auto max-sm:max-h-[calc(100dvh-32px)] sm:overflow-hidden">
        <Button
          type="button"
          variant="none"
          size="icon"
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full p-0 sm:top-6 sm:right-6"
          onClick={() => onOpenChange(false)}
          aria-label="Закрыть модальное окно"
        >
          <Close className="fill-gray-80 h-5 w-5" />
        </Button>

        <ModalHeader className="border-0 p-4 sm:p-6">
          <ModalTitle className="m-0 pr-10 text-gray-100">
            Информация о выставленном счёте
          </ModalTitle>
          <ModalDescription className="sr-only">
            Детали выставленного счёта, статус оплаты и позиции.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="flex flex-1 flex-col gap-6 p-4 max-sm:overflow-visible sm:overflow-y-auto sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="border-gray-20 flex flex-col gap-4 rounded-2xl border p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-60 text-sm">Дата выставления</span>
                  <div>{formatDate(data?.invoice.created_at || paymentDetails.created_at)}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-60 text-sm">Статус</span>
                  <span className="text-m-base text-gray-100">
                    {mapPaymentStatus[paymentStatus] || paymentStatus}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <UserProfile
                    userId={userId}
                    text={userData?.display_name || userData?.username || 'Пользователь'}
                    label={isTutor ? 'Ученик' : 'Репетитор'}
                    src={getUserAvatarUrl(userId)}
                    className="h-auto"
                  />
                </div>
              </div>
            </div>

            <div className="border-gray-20 flex flex-col gap-4 rounded-2xl border p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-60 text-sm">Тип оплаты</span>
                  <span className="text-m-base text-gray-100">
                    {paymentType ? mapPaymentType[paymentType] : 'Не указан'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-60 text-sm">Сумма</span>
                  <span className="text-brand-100 text-h6 font-medium">{totalAmount} ₽</span>
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-gray-60 text-sm">Комментарий к счёту</span>
                  <p className="text-gray-80 text-sm whitespace-pre-wrap">
                    {invoiceComment || 'Комментарий не указан.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section className="border-gray-20 flex flex-col gap-4 rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-m-base font-medium text-gray-100">Подробности счёта</h3>
            </div>

            {isLoadingInvoice && (
              <p className="text-gray-60 text-sm">Загружаем подробности по счёту...</p>
            )}

            {!isLoadingInvoice && isErrorInvoice && (
              <Alert variant="brand">
                <AlertIcon>
                  <InfoCircle className="fill-brand-100" />
                </AlertIcon>
                <AlertContainer>
                  <AlertTitle>Не удалось загрузить счёт</AlertTitle>
                  <AlertDescription>
                    Попробуйте обновить данные. Если ошибка повторится, проверьте соединение и
                    повторите позже.
                  </AlertDescription>
                </AlertContainer>
              </Alert>
            )}

            {!isLoadingInvoice && !isErrorInvoice && (
              <InvoiceItemsTable items={data?.invoice_items || []} />
            )}
          </section>
        </ModalBody>

        <ModalFooter className="flex w-full justify-end gap-4 border-0 p-4 sm:p-6">
          {isErrorInvoice && (
            <Button variant="secondary" className="w-31.75" onClick={() => refetchInvoice()}>
              Обновить
            </Button>
          )}

          <Button className="w-31.75" variant="secondary" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
