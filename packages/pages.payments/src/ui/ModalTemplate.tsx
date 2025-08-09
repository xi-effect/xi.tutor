import {
  Modal,
  ModalTitle,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { ModalTemplatePropsT } from '../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FormData } from '../model';
import * as z from 'zod';
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
import { useAddTemplate } from 'common.services';

export const ModalTemplate = ({ isOpen, type, onClose }: ModalTemplatePropsT) => {
  const initialValues = {
    name: '',
    price: '',
  };

  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const { isPending: isAdding, mutate: addTemplateMutation } = useAddTemplate();

  const handleAddTemplate = (formData: FormData) => {
    addTemplateMutation(formData, {
      onSuccess: () => {
        form.reset(initialValues);
        onClose();
      },
    });
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-[600px]">
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle>{type === 'edit' ? 'Редактирование' : 'Создание'} шаблона оплаты</ModalTitle>
        </ModalHeader>

        <Form {...form}>
          {/* @ts-expect-error ИСПРАВИТЬ ПОТОМ */}
          <form onSubmit={handleSubmit(handleAddTemplate)}>
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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="price"
                render={({ field }) => {
                  const value =
                    field.value === undefined || field.value === null ? '' : String(field.value);
                  return (
                    <FormItem className="pt-4">
                      <FormLabel htmlFor="price">Стоимость</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={value}
                          error={!!errors?.price}
                          autoComplete="off"
                          type="text"
                          id="price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </ModalBody>

            <ModalFooter className="flex flex-row items-center gap-2">
              <Button
                variant={isAdding ? 'ghost-spinner' : 'default'}
                className="gap-2"
                type="submit"
              >
                {type === 'edit' ? 'Сохранить' : 'Создать'}
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
