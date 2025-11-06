import { useEffect } from 'react';
import { useForm, useFieldArray } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from '@tanstack/react-router';
import { formSchema, type FormData } from '../model';
import { useCreateInvoice } from './useCreateInvoice';

export const useInvoiceForm = () => {
  const createInvoiceMutation = useCreateInvoice();

  // Получаем classroomId из URL опционально
  const params = useParams({ strict: false });
  const classroomIdFromUrl = params.classroomId || '';

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      classroomId: classroomIdFromUrl,
      items: [],
      comment: '',
    },
  });

  const { control, watch, setValue, handleSubmit } = form;

  // Обновляем classroomId при изменении URL
  useEffect(() => {
    if (classroomIdFromUrl) {
      setValue('classroomId', classroomIdFromUrl);
    }
  }, [classroomIdFromUrl, setValue]);

  const items = watch('items');

  const { fields, append } = useFieldArray({
    control,
    name: 'items',
  });

  const handleClearForm = () => {
    // При очистке формы устанавливаем classroomId из URL, если он доступен
    setValue('classroomId', classroomIdFromUrl);
    setValue('comment', '');
    setValue('items', [
      {
        name: '',
        price: 0,
        quantity: 0,
      },
    ]);
  };

  const onSubmit = (data: FormData) => {
    const comment: string | null = data.comment && data.comment.length > 0 ? data.comment : null;
    const payload = {
      invoice: { comment },
      items: [...data.items],
      student_ids: null,
    };

    createInvoiceMutation.mutate({ classroomId: data.classroomId, payload });
  };

  return {
    form,
    control,
    items,
    handleSubmit,
    fields,
    append,
    handleClearForm,
    onSubmit,
    isCreating: createInvoiceMutation.isPending,
  };
};
