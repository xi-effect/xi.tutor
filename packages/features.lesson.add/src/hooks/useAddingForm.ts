import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { formSchema, type FormData } from '../model/formSchema';
import { useFetchClassrooms } from 'common.services';
import { addDurationToTime } from '../utils/utils';

const DEFAULT_VALUES: FormData = {
  title: '',
  studentId: '',
  startTime: '17:40',
  duration: '1:20',
  startDate: new Date(),
  repeatMode: 'none',
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
    const endTime = addDurationToTime(data.startTime, data.duration);

    const payload = {
      title: data.title,
      studentIds,
      startTime: data.startTime,
      endTime,
      startDate: data.startDate,
      repeatMode: data.repeatMode,
    };

    console.log('payload', payload);

    // TODO: подключить API создания урока (common.api или модуль календаря)
    // await createLesson(payload);
    toast.success('Занятие добавлено');
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
