import { useEffect } from 'react';
import { Button } from '@xipkg/button';
import { Form, useFieldArray } from '@xipkg/form';
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
import { useTranslation } from 'react-i18next';
import { useInvoiceForm } from '../hooks';
import { roundMoney, type FormData } from '../model';
import { generateRandomId } from '../utils';
import { ClassroomSelector } from './ClassroomSelector';
import { CommentField } from './CommentField';
import { SubjectRow } from './SubjectRow';
import { SubjectRowMobile } from './SubjectRowMobile';
import { TemplateSelector } from './TemplateSelector';

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

type InvoiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const InvoiceModal = ({ open, onOpenChange }: InvoiceModalProps) => {
  const { t } = useTranslation('invoice');
  const isMobile = useMediaQuery('(max-width: 500px)');
  const isTablet = useMediaQuery('(max-width: 719px)');

  const { form, control, handleSubmit, handleClearForm, onSubmit, items, append } =
    useInvoiceForm();

  const { data: classrooms } = useFetchClassrooms();

  const totalLessons = items.reduce((acc, item) => acc + item.quantity, 0);

  const { remove } = useFieldArray({
    control,
    name: 'items',
  });

  const handleCloseModal = () => {
    handleClearForm();
    onOpenChange(false);
    cleanupBodyScrollLock();
  };

  useEffect(() => {
    if (open === false) cleanupBodyScrollLock();
    return cleanupBodyScrollLock;
  }, [open]);

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
    handleCloseModal();
  };

  // Вычисляем общую стоимость счёта
  const totalInvoicePrice = roundMoney(
    items.reduce((total, item) => {
      const priceNum = typeof item.price === 'string' ? Number(item.price) || 0 : item.price;
      return total + priceNum * (item.quantity || 0);
    }, 0),
  );

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (typeof next === 'boolean') onOpenChange(next);
        if (next === false) {
          handleClearForm();
          cleanupBodyScrollLock();
        }
      }}
    >
      <ModalContent className="max-w-[800px] max-sm:w-fit md:w-[800px]">
        {!isTablet ? (
          <ModalCloseButton className="" onClick={handleCloseModal}>
            <Close className="fill-icon-primary sm:fill-action-primary-text dark:fill-icon-primary" />
          </ModalCloseButton>
        ) : (
          <Close
            className="fill-icon-primary sm:fill-action-primary-text dark:fill-icon-primary absolute top-6 right-6 cursor-pointer"
            onClick={handleCloseModal}
          />
        )}

        <ModalHeader className="border-border-default border-b" innerClassName="max-sm:p-4">
          <ModalTitle className="text-text-primary max-[515px]:max-w-[215px] max-sm:text-xl">
            {t('modal.title')}
          </ModalTitle>
          <ModalDescription className="sr-only">{t('modal.description')}</ModalDescription>
        </ModalHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="flex flex-col gap-6 p-6 max-sm:p-4"
          >
            <div>
              <p className="text-text-primary max-sm:text-base">{t('modal.intro1')}</p>
              <p className="text-text-primary">{t('modal.intro2')}</p>
            </div>

            <ClassroomSelector control={control} />

            <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <Button
                className={`h-[32px] ${isMobile ? 'w-full' : 'w-fit'}`}
                variant="ghost"
                size="s"
                type="button"
                onClick={() => {
                  append({
                    id: generateRandomId(),
                    name: '',
                    price: 0,
                    quantity: 1,
                  });
                }}
              >
                {isMobile ? t('modal.addRow') : t('modal.addLesson')}
              </Button>

              <TemplateSelector control={control} />
            </div>

            {/* TODO: подумать над тем, чтобы сделать один компонент */}
            {!isMobile && items.length > 0 && (
              <div>
                <div className="text-text-secondary grid grid-cols-[2fr_1fr_auto_1fr_auto_1fr_auto] items-center gap-2 text-sm">
                  <span>{t('modal.lessons')}</span>
                  <span>{t('modal.price')}</span>
                  <div className="w-[12px]" />
                  <span>{t('modal.quantity')}</span>
                  <div className="w-[12px]" />
                  <span>{t('modal.sum')}</span>
                  <div className="ml-2 h-[24px] w-[24px]" />
                </div>
                <div className="my-2">
                  {items.map((item, index) => (
                    <SubjectRow
                      key={item.id}
                      control={control}
                      index={index}
                      onRemove={() => remove(index)}
                    />
                  ))}
                  <div className="grid grid-cols-[2fr_1fr_auto_1fr_auto_1fr_auto] items-center gap-2">
                    <div />
                    <span className="dark:text-text-primary text-right">{t('modal.total')}</span>
                    <div className="w-[12px]" />
                    <span className="dark:text-text-primary text-right">{totalLessons}</span>
                    <div className="w-[12px]" />
                    <span className="dark:text-text-primary text-right">{totalInvoicePrice} ₽</span>
                    <div className="ml-2 h-[24px] w-[24px]" />
                  </div>
                </div>
              </div>
            )}

            {isMobile && items.length > 0 && (
              <div>
                <div className="text-text-secondary grid grid-cols-3 items-center gap-2 text-sm">
                  <span>{t('modal.price')}</span>
                  <span>{t('modal.quantity')}</span>
                  <span>{t('modal.sum')}</span>
                </div>
                <div className="my-2 flex flex-col gap-3">
                  {items.map((_, index) => (
                    <SubjectRowMobile key={index} control={control} index={index} />
                  ))}
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="dark:text-text-primary text-right">{t('modal.total')}</span>
                    <span className="dark:text-text-primary text-center">{totalLessons}</span>
                    <span className="dark:text-text-primary text-right">{totalInvoicePrice} ₽</span>
                  </div>
                </div>
              </div>
            )}
            <CommentField control={control} />
            <ModalFooter
              className={`border-border-default flex gap-2 border-t px-0 pt-6 pb-0 ${isMobile ? 'flex-col' : ''}`}
            >
              <Button
                disabled={classrooms && classrooms.length === 0}
                className={`${isMobile ? 'w-full' : 'w-[114px]'} rounded-2xl`}
                type="submit"
                size="m"
                data-umami-event="invoice-create"
              >
                {t('modal.create')}
              </Button>
              <Button
                className={`${isMobile ? 'w-full' : 'w-[128px]'} rounded-2xl`}
                size="m"
                variant="ghost"
                onClick={handleCloseModal}
              >
                {t('modal.cancel')}
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
