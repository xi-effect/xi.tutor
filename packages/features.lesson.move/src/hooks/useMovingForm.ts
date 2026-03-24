import { useForm } from '@xipkg/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useFetchClassrooms } from 'common.services';
import { formSchema, type FormData } from '../model/formSchema';
import { addDurationToTime } from '../utils/utils';

const getDefaultValues = (initialDate?: Date | null): FormData => ({
  title: '',
  studentId: '',
  startTime: '17:40',
  duration: '1:20',
  startDate: initialDate ?? new Date(),
  moveMode: 'single_and_next',
});

export const useMovingForm = (initialDate?: Date | null) => {
  const { data: classrooms, isLoading: isClassroomsLoading } = useFetchClassrooms();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: getDefaultValues(initialDate),
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
      moveMode: data.moveMode,
    };

    console.log('move payload', payload);

    // TODO: подключить API переноса урока
    toast.success('Занятие перенесено');
  };

  const handleClearForm = () => {
    reset(getDefaultValues(initialDate));
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
