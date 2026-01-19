import { useEffect, useMemo } from 'react';
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
import { ModalTemplatePropsT } from '../../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FormData } from '../../model';
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
import { useAddTemplate, useUpdateTemplate } from 'common.services';

export const ModalTemplate = ({ isOpen, type, onClose, name, price, id }: ModalTemplatePropsT) => {
  const initialValues = useMemo(() => ({ name: name || '', price: price || '' }), [name, price]);

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

  const { isPending: isAdding, mutate: addTemplateMutation } = useAddTemplate();
  const { isPending: isUpdating, mutate: updateTemplateMutation } = useUpdateTemplate();

  const handleAddTemplate = (formData: FormData) => {
    addTemplateMutation(formData, {
      onSuccess: () => {
        form.reset(initialValues);
        onClose();
      },
    });
  };

  const handleUpdateTemplate = (formData: FormData) => {
    if (!id) return;

    updateTemplateMutation(
      { template_id: id, templateData: formData },
      {
        onSuccess: () => {
          form.reset(initialValues);
          onClose();
        },
      },
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset(initialValues);
      onClose();
    }
  };

  const onSubmit = (data: FormData) =>
    type === 'edit' ? handleUpdateTemplate(data) : handleAddTemplate(data);

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalContent className="max-w-[600px]" aria-describedby={undefined}>
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className="max-w-[calc(100%-56px)]">
            {type === 'edit' ? 'Редактирование' : 'Создание'} шаблона оплаты
          </ModalTitle>
        </ModalHeader>

        <Form {...form}>
          <form
            onSubmit={
              // @ts-expect-error zod preprocess возвращает unknown
              handleSubmit(onSubmit)
            }
          >
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
                        <div className="relative">
                          <Input
                            {...field}
                            value={value}
                            error={!!errors?.price}
                            autoComplete="off"
                            type="text"
                            id="price"
                            className="pr-2"
                          />
                          <span className="text-gray-60 absolute top-1/2 right-3 -translate-y-1/2">
                            ₽
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </ModalBody>

            <ModalFooter className="flex flex-row items-center gap-2">
              <Button
                variant={isAdding || isUpdating ? 'ghost-spinner' : 'default'}
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
