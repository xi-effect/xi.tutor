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
import { ModalEditMaterialNamePropsT } from 'common.types';
import { useEffect, useMemo } from 'react';
import * as z from 'zod';
import { FormData, formSchema } from '../model';

export const ModalEditMaterialName = ({
  isClassroom,
  isOpen,
  name,
  content_kind,
  isLoading = false,
  onClose,
  handleUpdateName,
}: ModalEditMaterialNamePropsT) => {
  const initialValues = useMemo(() => ({ name: name || '' }), [name]);

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
    handleUpdateName(isClassroom ? 'classroom' : 'tutor', data.name ?? '', onClose);
  };

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalContent className="max-w-[600px]" aria-describedby={undefined}>
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className="max-w-[calc(100%-48px)]">
            Редактирование {content_kind === 'note' ? 'заметки' : 'доски'}
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
                    <FormLabel htmlFor="name">Название</FormLabel>
                    <FormControl>
                      <Input
                        error={!!errors?.name}
                        autoComplete="off"
                        type="text"
                        id="name"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ModalBody>

            <ModalFooter className="flex flex-row items-center gap-2">
              <Button className="gap-2" type="submit">
                Сохранить
              </Button>
              <Button variant="secondary" onClick={onClose} type="button">
                Отменить
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
