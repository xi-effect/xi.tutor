import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, type FormData } from '../model/formSchema';
import { useFetchClassrooms } from 'common.services';

const DEFAULT_VALUES: FormData = {
  title: '',
  description: '',
  studentId: '',
  startTime: '09:00',
  endTime: '10:00',
  startDate: new Date().toLocaleDateString('ru-RU'),
  shouldRepeat: 'dont_repeat',
};

export const useAddingForm = () => {
  const { data: classrooms } = useFetchClassrooms();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
  });

  const { control, handleSubmit, setValue, formState } = form;

  console.log('errors', formState.errors);

  const onSubmit = (data: FormData) => {
    const student = classrooms?.find((c) => c.id === Number(data.studentId));

    const student_ids = student?.kind === 'individual' ? [student.student_id] : [];

    const payload = {
      title: data.title,
      description: data.description || '',
      student_ids,
      startTime: data.startTime,
      endTime: data.endTime,
      startDate: data.startDate,
      shouldRepeat: data.shouldRepeat,
    };

    console.log('payload', payload);
  };

  const handleClearForm = () => {
    setValue('title', DEFAULT_VALUES.title);
    setValue('description', DEFAULT_VALUES.description);
    setValue('studentId', DEFAULT_VALUES.studentId);
    setValue('startTime', DEFAULT_VALUES.startTime);
    setValue('endTime', DEFAULT_VALUES.endTime);
    setValue('startDate', DEFAULT_VALUES.startDate);
    setValue('shouldRepeat', DEFAULT_VALUES.shouldRepeat);
  };

  return {
    form,
    control,
    handleSubmit,
    onSubmit,
    handleClearForm,
  };
};
