import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@xipkg/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { useUpdateGroupClassroom, useUpdateIndividualClassroom } from 'common.services';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { FormData, useFormSchema } from '../model';
import { type ModalEditClassroomPropsT } from '../types';

export const ModalEditClassroomName = ({
  open,
  name,
  kind,
  classroomId,
  onClose,
}: ModalEditClassroomPropsT) => {
  const { t } = useTranslation('classroomRename');
  const initialValues = { name: name ?? '' };

  const { updateGroupClassroom, isUpdating: isUpdatingGroup } = useUpdateGroupClassroom();
  const { updateIndividualClassroom, isUpdating: isUpdatingIndividual } =
    useUpdateIndividualClassroom();
  const isUpdating = isUpdatingGroup || isUpdatingIndividual;

  const formSchema = useFormSchema();
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

    const onSuccess = () => {
      reset(initialValues);
      onClose();
    };

    if (kind === 'individual') {
      updateIndividualClassroom(
        {
          classroomId,
          data: {
            name_override: formValues.name,
          },
        },
        { onSuccess },
      );
      return;
    }

    updateGroupClassroom(
      {
        classroomId,
        data: {
          name: formValues.name,
        },
      },
      { onSuccess },
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (open) return;

    form.reset(initialValues);
    onClose();
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="max-w-md" aria-describedby={undefined}>
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className="text-text-primary max-w-[calc(100%-48px)] whitespace-pre-line">
            {t(`title.${kind}`)}
          </ModalTitle>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="px-4 py-2">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">{t(`fields.name.${kind}`)}</FormLabel>
                    <FormControl>
                      <Input
                        className="mt-1"
                        error={!!errors?.name}
                        disabled={isUpdating}
                        autoComplete="off"
                        type="text"
                        id="name"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-text-secondary pt-1 text-xs">
                      {t(`hint.${kind}`)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ModalBody>

            <ModalFooter className="flex flex-row items-center gap-2">
              <Button
                className="gap-2"
                type="submit"
                data-umami-event="classroom-rename-save"
                data-umami-event-type={name}
                disabled={isUpdating}
              >
                {t('actions.save')}
              </Button>
              <Button
                variant="ghost"
                type="button"
                data-umami-event="classroom-rename-cancel"
                disabled={isUpdating}
                onClick={onClose}
              >
                {t('actions.cancel')}
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
