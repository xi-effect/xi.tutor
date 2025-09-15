import { useEffect } from 'react';
import { useForm } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import {
  Modal,
  ModalTitle,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@xipkg/modal';
import { useUpdateIndividualClassroom } from 'common.services';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const descriptionSchema = z.object({
  description: z.string().max(500, 'Описание слишком длинное'),
});

type DescriptionFormData = z.infer<typeof descriptionSchema>;

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
  const { updateIndividualClassroom, isUpdating } = useUpdateIndividualClassroom();

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
      <ModalContent className="max-w-md" aria-describedby={undefined}>
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle>Редактировать описание</ModalTitle>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="px-4 py-2">
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">Описание кабинета</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="mt-1"
                        id="description"
                        placeholder="Введите описание кабинета..."
                        disabled={isUpdating}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ModalBody>

            <ModalFooter className="flex flex-row items-center gap-2">
              <Button
                variant={isUpdating ? 'ghost-spinner' : 'default'}
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button variant="secondary" onClick={onClose} type="button" disabled={isUpdating}>
                Отмена
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
