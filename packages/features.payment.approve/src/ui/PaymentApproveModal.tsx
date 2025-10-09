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
import { usePaymentApproveForm } from '../hooks';
import { PaymentFormData } from '../model';
import { PaymentT } from '../types';
import { formatDate } from '../utils';
import { UserProfile } from '@xipkg/userprofile';

type PaymentApproveModalPropsT = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentDetails: PaymentT;
};

export const PaymentApproveModal: FC<PaymentApproveModalPropsT> = ({
  open,
  onOpenChange,
  paymentDetails,
}) => {
  const { form, handleSubmit, handleClearForm, onSubmit } = usePaymentApproveForm();

  const handleCloseModal = () => {
    handleClearForm();
    onOpenChange(false);
  };

  const onFormSubmit = (data: PaymentFormData) => {
    onSubmit({
      ...data,
      ...paymentDetails,
      statusPayment: 'paid',
    });
    handleCloseModal();
  };

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
                  {formatDate(paymentDetails.datePayment)}
                </div>
                <UserProfile
                  userId={paymentDetails.idStudent}
                  text="Анна Смирнова"
                  label="Индивидуальное"
                  src="https://github.com/shadcn.png"
                  className="col-span-2 sm:col-span-1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <p>Текст комментария</p>
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
                            value="cash"
                            id="cash"
                            className="data-[state=checked]:border-brand-100 data-[state=checked]:bg-brand-100 text-gray-0 border-gray-30 dark:bg-gray-10 h-6 w-6 [&_span_svg]:h-3 [&_span_svg]:w-3"
                          />
                          <label htmlFor="cash" className="text-gray-100">
                            Наличные
                          </label>
                        </div>
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
                <div className="text-gray-80 flex gap-4 text-base">
                  <p className="w-[250px]">Занятие на 60 минут</p>
                  <div className="flex gap-2">
                    <p className="w-[78px]">
                      {paymentDetails.amountPayment}
                      <span className="text-brand-40 text-xs-base">₽</span>
                    </p>
                    <p className="text-gray-60 w-[10px]">x</p>
                    <p className="w-[78px]">1</p>
                    <p className="text-gray-60 w-[10px]">=</p>
                    <p className="w-[78px]">
                      {paymentDetails.amountPayment}
                      <span className="text-brand-40 text-xs-base">₽</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <p className="w-[250px] font-bold text-gray-100">Итого</p>
                  <div className="flex gap-2">
                    <p className="w-[78px]"></p>
                    <p className="text-gray-60 w-[10px]"></p>
                    <p className="w-[78px]"></p>
                    <p className="text-gray-60 w-[10px]"></p>
                    <p className="w-[78px]">
                      {paymentDetails.amountPayment}
                      <span className="text-brand-40 text-xs-base">₽</span>
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex max-w-85 gap-4 sm:max-w-150">
              <Button variant="default" className="w-38.5" type="submit">
                Подтвердить
              </Button>
              <Button variant="secondary" className="w-31.75" onClick={handleCloseModal}>
                Отменить
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
