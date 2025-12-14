import { Button } from '@xipkg/button';
import { Form } from '@xipkg/form';
import { Close } from '@xipkg/icons';
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import { useMediaQuery } from '@xipkg/utils';
import { useFetchClassrooms } from 'common.services';
import { useInvoiceForm } from '../hooks';
import type { FormData } from '../model';
import { ClassroomSelector } from './ClassroomSelector';
import { CommentField } from './CommentField';
import { SubjectRow } from './SubjectRow';
import { SubjectRowMobile } from './SubjectRowMobile';
import { TemplateSelector } from './TemplateSelector';

type InvoiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const InvoiceModal = ({ open, onOpenChange }: InvoiceModalProps) => {
  const isMobile = useMediaQuery('(max-width: 500px)');
  const isTablet = useMediaQuery('(max-width: 719px)');

  const { form, control, handleSubmit, handleClearForm, onSubmit, items, append } =
    useInvoiceForm();

  const { data: classrooms } = useFetchClassrooms();

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
      <ModalContent className="max-w-[800px] max-sm:w-fit md:w-[800px]">
        {!isTablet ? (
          <ModalCloseButton className="">
            <Close className="fill-gray-80 sm:fill-gray-0 dark:fill-gray-100" />
          </ModalCloseButton>
        ) : (
          <Close className="fill-gray-80 sm:fill-gray-0 absolute top-6 right-6 dark:fill-gray-100" />
        )}

        <ModalHeader className="border-gray-20 border-b" innerClassName="max-sm:p-4">
          <ModalTitle className="max-[515px]:max-w-[215px] max-sm:text-xl dark:text-gray-100">
            Создание счета на оплату
          </ModalTitle>
          <ModalDescription className="sr-only">Создание счета на оплату</ModalDescription>
        </ModalHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="flex flex-col gap-6 p-6 max-sm:p-4!"
          >
            <div>
              <p className="text-gray-100 max-sm:text-base">Вы создаёте и отправляете счёт.</p>
              <p className="text-gray-100">
                Ученик оплачивает счёт напрямую вам — переводом или наличными.
              </p>
            </div>

            <ClassroomSelector control={control} />

            <div className="flex flex-row gap-2">
              <Button
                className={`h-[32px] ${isMobile ? 'w-full' : 'w-fit'}`}
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
                {isMobile ? 'Добавить строку' : 'Добавить занятие'}
              </Button>

              {!isMobile && <TemplateSelector control={control} />}
            </div>

            {/* TODO: подумать над тем, чтобы сделать один компонент */}
            {!isMobile && items.length > 0 && (
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

            {isMobile && items.length > 0 && (
              <div>
                <div className="text-gray-60 grid grid-cols-3 items-center gap-2 text-sm">
                  <span>Стоимость</span>
                  <span>Количество</span>
                  <span>Сумма</span>
                </div>
                <div className="my-2">
                  {items.map((_, index) => (
                    <SubjectRowMobile key={index} control={control} index={index} />
                  ))}
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-right dark:text-gray-100">Итого:</span>
                    <span className="text-center dark:text-gray-100">{totalLessons}</span>
                    <span className="text-right dark:text-gray-100">{totalInvoicePrice} ₽</span>
                  </div>
                </div>
              </div>
            )}
            <CommentField control={control} />
            <ModalFooter
              className={`border-gray-20 flex gap-2 border-t px-0 pt-6 pb-0 ${isMobile ? 'flex-col' : ''}`}
            >
              <Button
                disabled={classrooms && classrooms.length === 0}
                className={`${isMobile ? 'w-full' : 'w-[114px]'} rounded-2xl`}
                type="submit"
                size="m"
              >
                Создать
              </Button>
              <Button
                className={`${isMobile ? 'w-full' : 'w-[128px]'} rounded-2xl`}
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
