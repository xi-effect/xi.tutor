import { useForm, useFieldArray } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, type FormData } from '../model';
import { useCreateInvoice } from './useCreateInvoice';

export const useInvoiceForm = () => {
  const createInvoiceMutation = useCreateInvoice();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      classroomId: '',
      items: [],
      comment: '',
    },
  });

  const { control, watch, setValue, handleSubmit } = form;

  const items = watch('items');

  const { fields, append } = useFieldArray({
    control,
    name: 'items',
  });

  const handleClearForm = () => {
    setValue('classroomId', '');
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
    const payload = {
      invoice: { comment: data.comment || '' },
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
