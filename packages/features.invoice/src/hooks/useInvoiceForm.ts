import { useForm, useFieldArray } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, type FormData } from '../model';
import { useFetchClassrooms } from 'common.services';
import { useCreateInvoice } from './useCreateInvoice';

export const useInvoiceForm = () => {
  const { data: classrooms } = useFetchClassrooms();
  const createInvoiceMutation = useCreateInvoice();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      studentId: '',
      items: [],
      comment: '',
    },
  });

  const { control, watch, setValue, handleSubmit, formState } = form;

  console.log('errors', formState.errors);

  const items = watch('items');

  const { fields, append } = useFieldArray({
    control,
    name: 'items',
  });

  const handleClearForm = () => {
    setValue('studentId', '');
    setValue('items', [
      {
        name: '',
        price: 0,
        quantity: 0,
      },
    ]);
  };

  const onSubmit = (data: FormData) => {
    const student = classrooms?.find((c) => c.id === Number(data.studentId));

    // Формируем payload для отправки
    const student_ids = student?.kind === 'individual' ? [student.student_id] : [];

    const payload = {
      invoice: { comment: data.comment || '' },
      items: [...data.items],
      student_ids,
    };

    createInvoiceMutation.mutate(payload);
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
