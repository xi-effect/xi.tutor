/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalDescription,
} from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { Radio, RadioItem } from '@xipkg/radio';
import { Form, FormField, FormItem, FormMessage } from '@xipkg/form';
import { usePaymentApproveForm, useUserByPaymentDetails } from '../hooks';
import { RolePaymentT } from 'common.types';
import { formatDate } from '../utils';
import { UserProfile } from '@xipkg/userprofile';
import { InvoiceItemT } from '../types';
import { PaymentFormData } from '../model';
import {
  useCurrentUser,
  useGetRecipientInvoiceByStudent,
  usePaymentReceiverConfirmation,
  useGetRecipientInvoiceByTutor,
} from 'common.services';
import { useTranslation } from 'react-i18next';

type ApproveFormPropsT = {
  recipientInvoiceId: number;
  isTutor: boolean;
  handleCloseModal: (handleClearForm?: () => void) => void;
  paymentDetails: RolePaymentT<'tutor'> | RolePaymentT<'student'>;
  userData: any;
  userId: number;
  data: any;
  isLoadingInvoice: boolean;
};

const ApproveForm = ({
  recipientInvoiceId,
  isTutor,
  handleCloseModal,
  paymentDetails,
  userData,
  userId,
  data,
  isLoadingInvoice,
}: ApproveFormPropsT) => {
  const { t } = useTranslation('paymentApprove');
  const { mutate: receiverConfirmationMutation, isPending } = usePaymentReceiverConfirmation({
    classroomId: paymentDetails.classroom_id?.toString(),
    onSuccess: () => {
      handleCloseModal();
    },
  });

  const mapPaymentType: Record<string, string> = {
    cash: t('paymentType.cashLower'),
    transfer: t('paymentType.transferLower'),
  };

  return (
    <>
      <ModalBody className="flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-6 sm:grid-cols-2">
          <div className="col-span-1 flex flex-col">{formatDate(paymentDetails.created_at)}</div>
          <UserProfile
            userId={userData?.id ?? 0}
            text={userData?.display_name ?? userData?.username ?? t('loading')}
            label={isTutor ? t('roles.student') : t('roles.tutor')}
            src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`}
            className="col-span-2 sm:col-span-1"
          />
        </div>
        {data.invoice.comment && (
          <div className="flex flex-col gap-2">
            <p>{data ? data.invoice.comment : ''}</p>
          </div>
        )}
        <div className="flex flex-row gap-2">
          <span className="text-m-base dark:text-text-primary">{t('paymentType.labelColon')}</span>
          <span className="text-text-primary text-m mr-8 ml-auto">
            {mapPaymentType[data?.recipient_invoice?.payment_type]}
          </span>
        </div>
        <div className="flex-col-4 grid gap-2 font-normal">
          <div className="text-text-secondary col-span-1 flex flex-row gap-4 text-sm">
            <p className="w-[250px]">{t('table.lessons')}</p>
            <p className="w-[84px]">{t('table.price')}</p>
            <p className="w-[84px]">{t('table.quantity')}</p>
            <p className="w-[84px]">{t('table.sum')}</p>
          </div>
          {data ? (
            <>
              {data.invoice_items && data.invoice_items.length > 0 ? (
                data.invoice_items.map((item: InvoiceItemT, index: number) => (
                  <div key={index} className="text-text-primary flex gap-4 text-base">
                    <p className="w-[250px]">{item.name}</p>
                    <div className="flex gap-2">
                      <p className="w-[78px]">
                        {item.price}
                        <span className="text-text-secondary text-xs-base-size">₽</span>
                      </p>
                      <p className="text-text-secondary w-[10px]">x</p>
                      <p className="w-[78px]">{item.quantity}</p>
                      <p className="text-text-secondary w-[10px]">=</p>
                      <p className="w-[78px]">
                        {parseFloat(item.price) * item.quantity}
                        <span className="text-text-secondary text-xs-base-size">₽</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-text-secondary text-sm">{t('table.detailsUnavailable')}</div>
              )}
            </>
          ) : isLoadingInvoice ? (
            <div className="text-text-secondary text-sm">{t('table.detailsLoading')}</div>
          ) : (
            <div className="text-text-secondary text-sm">{t('table.detailsUnavailable')}</div>
          )}

          <div className="flex gap-4 text-sm">
            <p className="text-text-primary w-[250px] font-bold">{t('table.total')}</p>
            <div className="flex gap-2">
              <p className="w-[78px]"></p>
              <p className="w-[10px]"></p>
              <p className="w-[78px]"></p>
              <p className="w-[10px]"></p>
              <p className="text-text-primary w-[78px] font-bold">
                {data?.recipient_invoice?.total || paymentDetails.total}
                <span className="text-text-secondary text-xs-base-size">₽</span>
              </p>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="flex max-w-85 gap-4 sm:max-w-150">
        <Button
          variant="default"
          className="w-38.5"
          onClick={() => receiverConfirmationMutation(recipientInvoiceId.toString())}
          disabled={isPending}
          data-umami-event="payment-receiver-confirm"
        >
          {isPending ? t('actions.confirming') : t('actions.confirm')}
        </Button>
        <Button
          variant="ghost"
          className="w-31.75"
          onClick={() => handleCloseModal()}
          disabled={isPending}
        >
          {t('actions.cancel')}
        </Button>
      </ModalFooter>
    </>
  );
};

type AdvanceFormPropsT = {
  recipientInvoiceId: number;
  isTutor: boolean;
  handleCloseModal: (handleClearForm?: () => void) => void;
  paymentDetails: RolePaymentT<'tutor'> | RolePaymentT<'student'>;
  userData: any;
  userId: number;
  data: any;
  isLoadingInvoice: boolean;
};

const AdvanceForm = ({
  recipientInvoiceId,
  isTutor,
  handleCloseModal,
  paymentDetails,
  userData,
  userId,
  data,
  isLoadingInvoice,
}: AdvanceFormPropsT) => {
  const { t } = useTranslation('paymentApprove');
  const { form, handleSubmit, onSubmit, isLoading } = usePaymentApproveForm(
    recipientInvoiceId,
    isTutor,
    paymentDetails.classroom_id?.toString(),
  );

  const onFormSubmit = (data: PaymentFormData) => {
    onSubmit(data);
    handleCloseModal();
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <ModalBody className="flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-6 sm:grid-cols-2">
            <div className="col-span-1 flex flex-col">{formatDate(paymentDetails.created_at)}</div>
            <UserProfile
              userId={userData?.id ?? 0}
              text={userData?.display_name ?? userData?.username ?? t('loading')}
              label={isTutor ? t('roles.student') : t('roles.tutor')}
              src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`}
              className="col-span-2 sm:col-span-1"
            />
          </div>
          {data.invoice.comment && (
            <div className="flex flex-col gap-2">
              <p>{data ? data.invoice.comment : ''}</p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <span className="text-m-base dark:text-text-primary">{t('paymentType.label')}</span>
            <FormField
              control={form.control}
              name="typePayment"
              render={({ field }) => (
                <FormItem>
                  <Radio
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue="cash"
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioItem
                        value="transfer"
                        id="transfer"
                        className="data-[state=checked]:bg-action-primary-background-pressed data-[state=checked]:border-border-focus text-text-on-accent dark:bg-background-subtle border-border-control h-6 w-6 [&>span>svg]:h-3 [&>span>svg]:w-3"
                      />
                      <label htmlFor="transfer" className="text-text-primary">
                        {t('paymentType.transfer')}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioItem
                        value="cash"
                        id="cash"
                        className="data-[state=checked]:border-border-focus data-[state=checked]:bg-action-primary-background-pressed text-text-on-accent border-border-control dark:bg-background-subtle h-6 w-6 [&_span_svg]:h-3 [&_span_svg]:w-3"
                      />
                      <label htmlFor="cash" className="text-text-primary">
                        {t('paymentType.cash')}
                      </label>
                    </div>
                  </Radio>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-col-4 grid gap-2 font-normal">
            <div className="text-text-secondary col-span-1 flex flex-row gap-4 text-sm">
              <p className="w-[250px]">{t('table.lessons')}</p>
              <p className="w-[84px]">{t('table.price')}</p>
              <p className="w-[84px]">{t('table.quantity')}</p>
              <p className="w-[84px]">{t('table.sum')}</p>
            </div>
            {data ? (
              <>
                {data.invoice_items && data.invoice_items.length > 0 ? (
                  data.invoice_items.map((item: InvoiceItemT, index: number) => (
                    <div key={index} className="text-text-primary flex gap-4 text-base">
                      <p className="w-[250px]">{item.name}</p>
                      <div className="flex gap-2">
                        <p className="w-[78px]">
                          {item.price}
                          <span className="text-text-secondary text-xs-base-size">₽</span>
                        </p>
                        <p className="text-text-secondary w-[10px]">x</p>
                        <p className="w-[78px]">{item.quantity}</p>
                        <p className="text-text-secondary w-[10px]">=</p>
                        <p className="w-[78px]">
                          {parseFloat(item.price) * item.quantity}
                          <span className="text-text-secondary text-xs-base-size">₽</span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-text-secondary text-sm">{t('table.detailsUnavailable')}</div>
                )}
              </>
            ) : isLoadingInvoice ? (
              <div className="text-text-secondary text-sm">{t('table.detailsLoading')}</div>
            ) : (
              <div className="text-text-secondary text-sm">{t('table.detailsUnavailable')}</div>
            )}

            <div className="flex gap-4 text-sm">
              <p className="text-text-primary w-[250px] font-bold">{t('table.total')}</p>
              <div className="flex gap-2">
                <p className="w-[78px]"></p>
                <p className="w-[10px]"></p>
                <p className="w-[78px]"></p>
                <p className="w-[10px]"></p>
                <p className="text-text-primary w-[78px] font-bold">
                  {data?.recipient_invoice?.total || paymentDetails.total}
                  <span className="text-text-secondary text-xs-base-size">₽</span>
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex max-w-85 gap-4 sm:max-w-150">
          <Button
            className="w-38.5"
            type="submit"
            disabled={isLoading}
            data-umami-event="payment-sender-confirm"
            data-umami-event-role={isTutor ? 'tutor' : 'student'}
          >
            {isLoading ? t('actions.confirming') : t('actions.confirm')}
          </Button>
          <Button
            variant="ghost"
            className="w-31.75"
            onClick={() => handleCloseModal()}
            disabled={isLoading}
          >
            {t('actions.cancel')}
          </Button>
        </ModalFooter>
      </form>
    </Form>
  );
};

type PaymentApproveModalPropsT = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentDetails: RolePaymentT<'tutor'> | RolePaymentT<'student'>;
  recipientInvoiceId: number;
};

export const PaymentApproveModal: FC<PaymentApproveModalPropsT> = ({
  open,
  onOpenChange,
  paymentDetails,
  recipientInvoiceId,
}) => {
  const { t } = useTranslation('paymentApprove');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { data: userData } = useUserByPaymentDetails(paymentDetails);

  const handleCloseModal = () => {
    onOpenChange(false);
  };

  const {
    data: dataByTutor,
    refetch: refetchByTutor,
    isLoading: isLoadingTutor,
  } = useGetRecipientInvoiceByTutor(recipientInvoiceId, !open || !isTutor || !recipientInvoiceId);
  const {
    data: dataByStudent,
    refetch: refetchByStudent,
    isLoading: isLoadingStudent,
  } = useGetRecipientInvoiceByStudent(recipientInvoiceId, !open || isTutor || !recipientInvoiceId);
  const data = isTutor ? dataByTutor : dataByStudent;
  const refetch = isTutor ? refetchByTutor : refetchByStudent;
  const isLoadingInvoice = isTutor ? isLoadingTutor : isLoadingStudent;

  useEffect(() => {
    if (open && recipientInvoiceId && !data && !isLoadingInvoice) {
      refetch();
    }
  }, [open, recipientInvoiceId, data, refetch, isLoadingInvoice]);

  const userId = isTutor
    ? (paymentDetails as RolePaymentT<'student'>).student_id
    : (paymentDetails as RolePaymentT<'tutor'>).tutor_id;

  return (
    <Modal open={open} onOpenChange={handleCloseModal}>
      <ModalContent className="max-w-150 min-w-85">
        <ModalHeader className="max-w-85 sm:max-w-150">
          <ModalCloseButton
            variant="full"
            className="bg-background-page top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full px-0 pt-0 sm:right-4"
          >
            <Close className="fill-icon-primary h-5 w-5" />
          </ModalCloseButton>
          <ModalTitle className="text-text-primary m-0 pr-10 sm:pr-0">
            {t('modal.title')}
          </ModalTitle>
          <ModalDescription className="sr-only">{t('modal.description')}</ModalDescription>
        </ModalHeader>
        {data && data.recipient_invoice.status !== 'wf_receiver_confirmation' && (
          <AdvanceForm
            recipientInvoiceId={recipientInvoiceId}
            handleCloseModal={handleCloseModal}
            isLoadingInvoice={isLoadingInvoice}
            data={data}
            paymentDetails={paymentDetails}
            userData={userData}
            userId={userId}
            isTutor={isTutor}
          />
        )}
        {data && data.recipient_invoice.status === 'wf_receiver_confirmation' && (
          <ApproveForm
            recipientInvoiceId={recipientInvoiceId}
            handleCloseModal={handleCloseModal}
            isLoadingInvoice={isLoadingInvoice}
            data={data}
            paymentDetails={paymentDetails}
            userData={userData}
            userId={userId}
            isTutor={isTutor}
          />
        )}
      </ModalContent>
    </Modal>
  );
};
