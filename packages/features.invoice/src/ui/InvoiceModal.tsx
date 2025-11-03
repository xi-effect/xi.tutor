import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalCloseButton,
  ModalDescription,
} from '@xipkg/modal';
import { Form } from '@xipkg/form';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { useInvoiceForm } from '../hooks';
import type { FormData } from '../model';
import { SubjectRow } from './SubjectRow';
import { CommentField } from './CommentField';
import { ClassroomSelector } from './ClassroomSelector';
import { TemplateSelector } from './TemplateSelector';

type InvoiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const InvoiceModal = ({ open, onOpenChange }: InvoiceModalProps) => {
  const {
    form,
    control,
    handleSubmit,
    // fields,
    handleClearForm,
    onSubmit,
    items,
    append,
  } = useInvoiceForm();

  const totalLessons = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCloseModal = () => {
    handleClearForm();
    onOpenChange(false);
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
    handleCloseModal();
  };

  // Вычисляем общую стоимость счёта
  const totalInvoicePrice = items.reduce((total, item) => {
    return total + item.price * (item.quantity || 0);
  }, 0);

  return (
    <Modal open={open} onOpenChange={handleCloseModal}>
      <ModalContent className="max-w-[800px] md:w-[800px]">
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0 dark:fill-gray-100" />
        </ModalCloseButton>
        <ModalHeader className="border-gray-20 border-b">
          <ModalTitle className="dark:text-gray-100">Создание счета на оплату</ModalTitle>
          <ModalDescription className="sr-only">Создание счета на оплату</ModalDescription>
        </ModalHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-6 p-6">
            <div>
              <p className="text-gray-100">Вы создаёте и отправляете счёт.</p>
              <p className="text-gray-100">
                Ученик оплачивает счёт напрямую вам — переводом или наличными.
              </p>
            </div>

            <ClassroomSelector control={control} />

            <div className="flex flex-row gap-2">
              <Button
                className="h-[32px]"
                variant="secondary"
                size="s"
                type="button"
                onClick={() => {
                  append({
                    name: '',
                    price: 0,
                    quantity: 1,
                  });
                }}
              >
                Добавить занятие
              </Button>

              <TemplateSelector control={control} />
            </div>

            {items.length > 0 && (
              <div>
                <div className="text-gray-60 grid grid-cols-[2fr_1fr_auto_1fr_auto_1fr_auto] items-center gap-2 text-sm">
                  <span>Занятия</span>
                  <span>Стоимость</span>
                  <div className="w-[12px]" />
                  <span>Количество</span>
                  <div className="w-[12px]" />
                  <span>Сумма</span>
                  <div className="ml-2 h-[24px] w-[24px]" />
                </div>
                <div className="my-2">
                  {items.map((_, index) => (
                    <SubjectRow key={index} control={control} index={index} />
                  ))}
                  <div className="grid grid-cols-[2fr_1fr_auto_1fr_auto_1fr_auto] items-center gap-2">
                    <div />
                    <span className="text-right dark:text-gray-100">Итого:</span>
                    <div className="w-[12px]" />
                    <span className="text-right dark:text-gray-100">{totalLessons}</span>
                    <div className="w-[12px]" />
                    <span className="text-right dark:text-gray-100">{totalInvoicePrice} ₽</span>
                    <div className="ml-2 h-[24px] w-[24px]" />
                  </div>
                </div>
              </div>
            )}
            <CommentField control={control} />
            <ModalFooter className="border-gray-20 flex gap-2 border-t px-0 pt-6 pb-0">
              <Button className="w-[114px] rounded-2xl" type="submit" size="m">
                Создать
              </Button>
              <Button
                className="w-[128px] rounded-2xl"
                size="m"
                variant="secondary"
                onClick={handleCloseModal}
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
