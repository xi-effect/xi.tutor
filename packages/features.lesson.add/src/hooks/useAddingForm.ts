import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { formSchema, type FormData } from '../model/formSchema';
import { useFetchClassrooms } from 'common.services';

const DEFAULT_VALUES: FormData = {
  title: '',
  description: '',
  studentId: '',
  startTime: '09:00',
  endTime: '10:00',
  startDate: new Date(),
  shouldRepeat: 'dont_repeat',
};

export const useAddingForm = () => {
  const { data: classrooms, isLoading: isClassroomsLoading } = useFetchClassrooms();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = (data: FormData) => {
    const classroom = classrooms?.find((c) => c.id === Number(data.studentId));
    const studentIds = classroom?.kind === 'individual' ? [classroom.student_id] : [];

    const payload = {
      title: data.title,
      description: data.description ?? '',
      studentIds,
      startTime: data.startTime,
      endTime: data.endTime,
      startDate: data.startDate,
      shouldRepeat: data.shouldRepeat,
    };

    console.log('payload', payload);

    // TODO: подключить API создания урока (common.api или модуль календаря)
    // await createLesson(payload);
    toast.success('Урок назначен');
  };

  const handleClearForm = () => {
    reset(DEFAULT_VALUES);
  };

  return {
    form,
    control,
    handleSubmit,
    onSubmit,
    handleClearForm,
    classrooms: classrooms ?? [],
    isClassroomsLoading,
  };
};
