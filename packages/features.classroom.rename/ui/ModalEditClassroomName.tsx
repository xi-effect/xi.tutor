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
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import { useUpdateGroupClassroom } from 'common.services';
import { z } from 'zod';
import { FormData, formSchema } from '../model';
import { type ModalEditClassroomPropsT } from '../types';

export const ModalEditClassroomName = ({
  open,
  name,
  classroomId,
  onClose,
}: ModalEditClassroomPropsT) => {
  const initialValues = { name: name ?? '' };

  // Mutations
  const { updateGroupClassroom, isUpdating } = useUpdateGroupClassroom();

  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const onSubmit = (formValues: FormData) => {
    if (!classroomId) return;

    updateGroupClassroom(
      {
        classroomId,
        data: {
          name: formValues.name,
        },
      },
      {
        onSuccess: () => {
          reset(initialValues);
          onClose();
        },
      },
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (open) return;

    form.reset(initialValues);
    onClose();
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="max-w-150" aria-describedby="Invoice template">
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className="max-w-[calc(100%-48px)]">Шаблон счёта</ModalTitle>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="px-4 py-2">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">Название</FormLabel>
                    <FormControl>
                      <Input
                        error={!!errors?.name}
                        disabled={isUpdating}
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
            </ModalBody>

            <ModalFooter className="flex flex-row items-center gap-2">
              <Button
                className="gap-2"
                type="submit"
                data-umami-event="material-edit-save"
                data-umami-event-type={name}
                disabled={isUpdating}
              >
                Сохранить
              </Button>
              <Button
                variant="secondary"
                type="button"
                data-umami-event="material-edit-cancel"
                disabled={isUpdating}
                onClick={onClose}
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
