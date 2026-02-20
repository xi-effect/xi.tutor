import React, { useState, useRef } from 'react';
import {
  Modal,
  ModalTitle,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalTrigger,
  ModalCloseButton,
  ModalDescription,
} from '@xipkg/modal';
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
import { Autocomplete } from './Autocomplete';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema } from '../model';
import { useCreateGroup } from '../services';

const initialValues = { name: '', subject: 0 };

export const ModalAddGroup = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setModalOpen] = useState(false);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const { mutate: createGroup, isPending } = useCreateGroup();

  type FormValues = z.infer<typeof formSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset(initialValues);
    setModalOpen(isOpen);
  };

  const closeModal = () => {
    reset(initialValues);
    setModalOpen(false);
  };

  const onSubmit = (data: FormValues) => {
    createGroup(
      {
        subject_id: data.subject,
        name: data.name,
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
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent
        ref={modalContentRef}
        className="relative max-w-[600px]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <ModalHeader>
          <ModalCloseButton onClick={closeModal} />
          <ModalTitle className="m-0 pr-10 leading-8 dark:text-gray-100">
            Создание группы
          </ModalTitle>
          <ModalDescription className="sr-only">
            Модальное окно для создания новой группы
          </ModalDescription>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="flex flex-col gap-6 px-4 py-6">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel htmlFor={field.name} className="m-0">
                      Название
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
                    <FormLabel htmlFor={field.name} className="m-0">
                      Предмет
                    </FormLabel>
                    <FormControl>
                      <Autocomplete field={field} containerRef={modalContentRef} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ModalBody>

            <ModalFooter className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <Button
                className="gap-2"
                type="submit"
                onClick={handleButtonClick}
                disabled={isPending}
                data-umami-event="group-create"
              >
                {isPending ? 'Создание...' : 'Создать'}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  handleButtonClick();
                  closeModal();
                }}
                data-umami-event="group-create-cancel"
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
