import { useState } from 'react';
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
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema } from '../model';

const initialValues = { name: '', subject: '' };

export const ModalAddClassroom = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setModalOpen] = useState(false);

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
    //временно пока нет интеграции с бэкендом
    console.log('form data: ', data);
    closeModal();
  };

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="max-w-[600px]">
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
                      <Input
                        {...field}
                        error={!!errors?.subject}
                        autoComplete="off"
                        type="text"
                        id={field.name}
                        placeholder="Введите предметы через запятую"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ModalBody>

            <ModalFooter className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <Button className="gap-2" type="submit">
                Создать
              </Button>
              <Button variant="border" type="button" onClick={closeModal}>
                Отменить
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
