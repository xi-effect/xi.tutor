import { FC } from 'react';
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
import { Radio, RadioItem } from '@xipkg/radio';
import { Form, FormField, FormItem, FormMessage } from '@xipkg/form';
import { usePaymentApproveForm, useUserByPaymentDetails } from '../hooks';
import { RolePaymentT } from 'features.table';
import { formatDate } from '../utils';
import { UserProfile } from '@xipkg/userprofile';
import { InvoiceItemT } from '../types';
import { PaymentFormData } from '../model';
import { useCurrentUser, useGetRecipientInvoiceByStudent } from 'common.services';
import { useGetRecipientInvoiceByTutor } from '../../../common.services/src/payments/useGetRecipientInvoiceByTutor';

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
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { data: userData } = useUserByPaymentDetails(paymentDetails);
  const { form, handleSubmit, handleClearForm, onSubmit, isLoading } = usePaymentApproveForm(
    recipientInvoiceId,
    isTutor,
  );

  const handleCloseModal = () => {
    handleClearForm();
    onOpenChange(false);
  };

  const onFormSubmit = (data: PaymentFormData) => {
    onSubmit(data);
    handleCloseModal();
  };

  const getRecipientInvoice = isTutor
    ? useGetRecipientInvoiceByTutor
    : useGetRecipientInvoiceByStudent;
  const { data } = getRecipientInvoice(recipientInvoiceId);

  const userId = isTutor
    ? (paymentDetails as RolePaymentT<'student'>).student_id
    : (paymentDetails as RolePaymentT<'tutor'>).tutor_id;

  return (
    <Modal open={open} onOpenChange={handleCloseModal}>
      <ModalContent className="max-w-150 min-w-85">
        <ModalHeader className="max-w-85 sm:max-w-150">
          <ModalCloseButton />
          <ModalTitle className="m-0 pr-10 text-gray-100 sm:pr-0">
            Подтверждение оплаты по счёту
          </ModalTitle>
          <ModalDescription />
        </ModalHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <ModalBody className="flex flex-col gap-6">
              <div className="grid grid-cols-4 gap-6 sm:grid-cols-2">
                <div className="col-span-1 flex flex-col">
                  {formatDate(paymentDetails.created_at)}
                </div>
                <UserProfile
                  userId={userData?.id ?? 0}
                  text={userData?.display_name ?? userData?.username ?? 'Загрузка...'}
                  label={isTutor ? 'Ученик' : 'Репетитор'}
                  src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`}
                  className="col-span-2 sm:col-span-1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <p>{data ? data.invoice.comment : ''}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-m-base dark:text-gray-100">Тип оплаты</span>
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
                            className="data-[state=checked]:bg-brand-100 data-[state=checked]:border-brand-100 text-gray-0 dark:bg-gray-10 border-gray-30 h-6 w-6 [&>span>svg]:h-3 [&>span>svg]:w-3"
                          />
                          <label htmlFor="transfer" className="text-gray-100">
                            Перевод
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioItem
                            value="cash"
                            id="cash"
                            className="data-[state=checked]:border-brand-100 data-[state=checked]:bg-brand-100 text-gray-0 border-gray-30 dark:bg-gray-10 h-6 w-6 [&_span_svg]:h-3 [&_span_svg]:w-3"
                          />
                          <label htmlFor="cash" className="text-gray-100">
                            Наличные
                          </label>
                        </div>
                      </Radio>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-col-4 grid gap-2 font-normal">
                <div className="text-gray-60 col-span-1 flex flex-row gap-4 text-sm">
                  <p className="w-[250px]">Занятия</p>
                  <p className="w-[84px]">Стоимость</p>
                  <p className="w-[84px]">Количество</p>
                  <p className="w-[84px]">Сумма</p>
                </div>
                {data ? (
                  <>
                    {data.invoice_items.map((item: InvoiceItemT, index: number) => (
                      <div key={index} className="text-gray-80 flex gap-4 text-base">
                        <p className="w-[250px]">{item.name}</p>
                        <div className="flex gap-2">
                          <p className="w-[78px]">
                            {item.price}
                            <span className="text-gray-60 text-xs-base">₽</span>
                          </p>
                          <p className="text-gray-60 w-[10px]">x</p>
                          <p className="w-[78px]">{item.quantity}</p>
                          <p className="text-gray-60 w-[10px]">=</p>
                          <p className="w-[78px]">
                            {parseFloat(item.price) * item.quantity}
                            <span className="text-gray-60 text-xs-base">₽</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : null}

                <div className="flex gap-4 text-sm">
                  <p className="w-[250px] font-bold text-gray-100">Итого:</p>
                  <div className="flex gap-2">
                    <p className="w-[78px]"></p>
                    <p className="w-[10px]"></p>
                    <p className="w-[78px]"></p>
                    <p className="w-[10px]"></p>
                    <p className="w-[78px]">
                      {data?.recipient_invoice.total}
                      <span className="text-gray-60 text-xs-base">₽</span>
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex max-w-85 gap-4 sm:max-w-150">
              <Button variant="default" className="w-38.5" type="submit" disabled={isLoading}>
                {isLoading ? 'Подтверждение...' : 'Подтвердить'}
              </Button>
              <Button
                variant="secondary"
                className="w-31.75"
                onClick={handleCloseModal}
                disabled={isLoading}
              >
                Отменить
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
