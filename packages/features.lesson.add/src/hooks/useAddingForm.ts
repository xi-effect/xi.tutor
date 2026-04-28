import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { formSchema, type FormData, type FormInput } from '../model/formSchema';
import { useFetchClassrooms } from 'common.services';
import { addDurationToTime } from '../utils/utils';

type UseAddingFormOptions = {
  fixedClassroomId?: number;
  onSubmit?: (data: FormData) => void | Promise<void>;
};

const getDefaultValues = (initialDate?: Date | null, fixedClassroomId?: number): FormInput => ({
  title: '',
  studentId: fixedClassroomId != null ? String(fixedClassroomId) : '',
  startTime: '17:40',
  duration: '1:20',
  startDate: initialDate ?? new Date(),
  repeatMode: 'none',
  repeatDays: [],
});

export const useAddingForm = (initialDate?: Date | null, options: UseAddingFormOptions = {}) => {
  const { data: classrooms, isLoading: isClassroomsLoading } = useFetchClassrooms();
  const { fixedClassroomId, onSubmit: externalSubmit } = options;

  const form = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: getDefaultValues(initialDate, fixedClassroomId),
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = async (data: FormData) => {
    if (externalSubmit) {
      await externalSubmit(data);
      return;
    }

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
      ...(data.repeatMode === 'custom' && { repeatDays: data.repeatDays }),
    };

    console.log('payload', payload);

    // TODO: подключить API создания урока (common.api или модуль календаря)
    // await createLesson(payload);
    toast.success('Занятие добавлено');
  };

  const handleClearForm = () => {
    reset(getDefaultValues(initialDate, fixedClassroomId));
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
