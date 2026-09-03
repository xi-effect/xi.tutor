import React, { useState, useRef, useEffect } from 'react';
import { Modal, ModalTitle, ModalContent, ModalTrigger, ModalDescription } from '@xipkg/modal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@xipkg/form';
import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { Autocomplete } from './Autocomplete';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormSchema } from '../model';
import { useCreateGroup } from '../services';
import {
  ModalCloseIcon,
  modalBodyClass,
  modalCancelButtonClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalFooterClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';

const initialValues = { name: '', subject: null };

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

type ModalAddGroupProps = {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ModalAddGroup = ({
  children,
  open: controlledOpen,
  onOpenChange,
}: ModalAddGroupProps) => {
  const { t } = useTranslation('groupAdd');
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setModalOpen = isControlled ? (value: boolean) => onOpenChange?.(value) : setInternalOpen;

  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const { mutate: createGroup, isPending } = useCreateGroup();

  const formSchema = useFormSchema();
  type FormValues = z.infer<typeof formSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = form;

  const nameValue = watch('name');
  const canSubmit = Boolean(nameValue?.trim()) && !isPending;

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(initialValues);
    setModalOpen(next);
  };

  const closeModal = () => {
    reset(initialValues);
    setModalOpen(false);
    cleanupBodyScrollLock();
  };

  useEffect(() => {
    if (isOpen === false) cleanupBodyScrollLock();
    return cleanupBodyScrollLock;
  }, [isOpen]);

  const onSubmit = (data: FormValues) => {
    createGroup(
      {
        subject_id: data.subject,
        name: data.name.trim(),
      },
      {
        onSuccess: () => {
          closeModal();
        },
        onError: (error) => {
          console.error('Ошибка при создании группы:', error);
        },
      },
    );
  };

  // Закрываем Popover при клике на кнопки
  const handleButtonClick = () => {
    // Закрываем все открытые Popover
    const popoverElements = document.querySelectorAll('[data-radix-popper-content-wrapper]');
    popoverElements.forEach((element) => {
      element.remove();
    });
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(next) => {
        handleOpenChange(next);
        if (next === false) cleanupBodyScrollLock();
      }}
    >
      {children != null && <ModalTrigger asChild>{children}</ModalTrigger>}
      <ModalContent
        ref={modalContentRef}
        className={modalContentClass}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Form {...form}>
          <form className={modalBodyClass} onSubmit={handleSubmit(onSubmit)}>
            <div className={modalHeaderRowClass}>
              <ModalTitle className={modalTitleClass}>{t('title')}</ModalTitle>
              <ModalCloseIcon onClick={closeModal} />
            </div>
            <ModalDescription className="sr-only">{t('description')}</ModalDescription>

            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel htmlFor={field.name} className="text-text-primary m-0">
                    {t('fields.name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      error={!!errors?.name}
                      autoComplete="off"
                      type="text"
                      id={field.name}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="subject"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel htmlFor={field.name} className="text-text-primary m-0">
                    {t('fields.subject')}
                  </FormLabel>
                  <FormControl>
                    <Autocomplete field={field} containerRef={modalContentRef} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className={modalFooterClass}>
              <Button
                variant="none"
                type="button"
                size="m"
                className={modalCancelButtonClass}
                onClick={() => {
                  handleButtonClick();
                  closeModal();
                }}
                data-umami-event="group-create-cancel"
              >
                {t('actions.cancel')}
              </Button>
              <Button
                variant="primary"
                size="m"
                className={modalConfirmButtonClass}
                type="submit"
                onClick={handleButtonClick}
                disabled={!canSubmit}
                data-umami-event="group-create"
              >
                {isPending ? t('actions.creating') : t('actions.create')}
              </Button>
            </div>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
