import { useForm, useFieldArray } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { formSchema, type FormData } from '../model';
import { students } from '../mocks';

export const useInvoiceForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      studentId: '',
      items: [
        {
          name: '',
          price: 0,
          quantity: 1,
        },
      ],
      comment: '',
    },
  });

  const { control, watch, setValue, handleSubmit } = form;

  const selectedStudentId = watch('studentId');
  const items = watch('items');

  const { fields } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedData = useMemo(() => {
    const student = students.find((s) => s.id === selectedStudentId);
    return { student, subjects: student?.subjects || [] };
  }, [selectedStudentId]);

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
    console.log('invoice form data: ', data);
  };

  return {
    form,
    control,
    items,
    handleSubmit,
    selectedData,
    fields,
    handleClearForm,
    onSubmit,
  };
};
