import { useEffect, useMemo } from 'react';
import { useForm } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { Modal, ModalTitle, ModalContent } from '@xipkg/modal';
import { useUpdateIndividualClassroom } from 'common.services';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

type DescriptionFormData = {
  description: string;
};

interface EditDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  description: string | null;
  classroomId: number;
}

export const EditDescriptionModal = ({
  isOpen,
  onClose,
  description,
  classroomId,
}: EditDescriptionModalProps) => {
  const { t } = useTranslation('classroom');
  const { updateIndividualClassroom, isUpdating } = useUpdateIndividualClassroom();

  const descriptionSchema = useMemo(
    () =>
      z.object({
        description: z.string().max(500, t('descriptionModal.tooLong')),
      }),
    [t],
  );

  const form = useForm<DescriptionFormData>({
    resolver: zodResolver(descriptionSchema),
    defaultValues: {
      description: description || '',
    },
  });

  const { control, handleSubmit, reset } = form;

  useEffect(() => {
    if (isOpen) {
      reset({ description: description || '' });
    }
  }, [isOpen, description, reset]);

  const onSubmit = (data: DescriptionFormData) => {
    updateIndividualClassroom(
      {
        classroomId,
        data: { description: data.description },
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (error) => {
          console.error('Ошибка при обновлении описания:', error);
        },
      },
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset({ description: description || '' });
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalContent className={modalContentClass} aria-describedby={undefined}>
        <Form {...form}>
          <form className={modalBodyClass} onSubmit={handleSubmit(onSubmit)}>
            <div className={modalHeaderRowClass}>
              <ModalTitle className={modalTitleClass}>{t('descriptionModal.title')}</ModalTitle>
              <ModalCloseIcon onClick={onClose} disabled={isUpdating} />
            </div>

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="description">{t('descriptionModal.label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="mt-1"
                      id="description"
                      placeholder={t('descriptionModal.placeholder')}
                      disabled={isUpdating}
                      autoComplete="off"
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
                disabled={isUpdating}
              >
                {t('actions.cancel')}
              </Button>
              <Button
                variant={isUpdating ? 'ghost-spinner' : 'primary'}
                size="m"
                className={modalConfirmButtonClass}
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? t('actions.saving') : t('actions.save')}
              </Button>
            </div>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
