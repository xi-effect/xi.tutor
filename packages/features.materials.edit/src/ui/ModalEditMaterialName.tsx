import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@xipkg/button';
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
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { ModalEditMaterialNamePropsT } from 'common.types';
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
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormData, useFormSchema } from '../model';

export const ModalEditMaterialName = ({
  isClassroom,
  isOpen,
  name,
  content_kind,
  isLoading = false,
  onClose,
  handleUpdateName,
}: ModalEditMaterialNamePropsT) => {
  const { t } = useTranslation('materialsEdit');
  const formSchema = useFormSchema();
  const initialValues = useMemo(() => ({ name: name || '' }), [name]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [initialValues, reset, isOpen]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      onClose();
    }
  };

  const onSubmit = (data: FormData) => {
    handleUpdateName(isClassroom ? 'classroom' : 'personal', data.name, onClose);
  };

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalContent className={modalContentClass} aria-describedby={undefined}>
        <Form {...form}>
          <form className={modalBodyClass} onSubmit={handleSubmit(onSubmit)}>
            <div className={modalHeaderRowClass}>
              <ModalTitle className={modalTitleClass}>
                {content_kind === 'note' ? t('titleNote') : t('titleBoard')}
              </ModalTitle>
              <ModalCloseIcon onClick={onClose} />
            </div>

            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">{t('nameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      error={!!errors?.name}
                      disabled={isLoading}
                      autoComplete="off"
                      type="text"
                      id="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className={modalFooterClass}>
              <Button
                variant="none"
                size="m"
                className={modalCancelButtonClass}
                onClick={onClose}
                type="button"
                data-umami-event="material-edit-cancel"
              >
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                size="m"
                className={modalConfirmButtonClass}
                type="submit"
                data-umami-event="material-edit-save"
                data-umami-event-type={content_kind}
              >
                {t('save')}
              </Button>
            </div>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
