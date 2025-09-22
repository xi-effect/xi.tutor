import { useForm } from '@xipkg/form';
import { Editor } from 'modules.editor';
// import { Input } from '@xipkg/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@xipkg/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@xipkg/form';

import { useEffect, useRef, useCallback } from 'react';
import { ClassroomT, ClassroomStatusT } from 'common.api';
import { useUpdateClassroomStatus, useUpdateIndividualClassroom } from 'common.services';
import { Autocomplete } from './Autocomplete';
interface FormData {
  status: ClassroomStatusT;
  subject: number | null;
}

export const Information = ({ classroom }: { classroom: ClassroomT }) => {
  console.log('classroom', classroom);

  const { updateClassroomStatus, isUpdating } = useUpdateClassroomStatus();
  const { updateIndividualClassroom, isUpdating: isUpdatingIndividualClassroom } =
    useUpdateIndividualClassroom();

  const form = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      status: classroom?.status || 'active',
      subject: classroom?.subject_id || null,
    },
  });

  // Сохраняем исходные значения для сравнения
  const initialValues = useRef<FormData>({
    status: classroom?.status || 'active',
    subject: classroom?.subject_id || null,
  });

  const onSubmit = useCallback(
    async (data: FormData) => {
      console.log('Form submitted with data:', data);

      if (!classroom?.id) {
        console.error('Classroom ID is required');
        return;
      }

      try {
        // Проверяем, что изменилось
        const statusChanged = data.status !== initialValues.current.status;
        const subjectChanged = data.subject !== initialValues.current.subject;

        if (!statusChanged && !subjectChanged) {
          console.log('No changes detected');
          return;
        }

        // Выполняем обновления параллельно, если нужно обновить оба поля
        const promises = [];

        if (statusChanged) {
          promises.push(
            new Promise((resolve, reject) => {
              updateClassroomStatus(
                {
                  classroomId: classroom.id,
                  status: data.status,
                },
                {
                  onSuccess: () => {
                    console.log('Classroom status updated successfully');
                    resolve(true);
                  },
                  onError: (error) => {
                    console.error('Failed to update classroom status:', error);
                    reject(error);
                  },
                },
              );
            }),
          );
        }

        if (subjectChanged) {
          promises.push(
            new Promise((resolve, reject) => {
              updateIndividualClassroom(
                {
                  classroomId: classroom.id,
                  data: { subject_id: data.subject },
                },
                {
                  onSuccess: () => {
                    console.log('Classroom subject updated successfully');
                    resolve(true);
                  },
                  onError: (error) => {
                    console.error('Failed to update classroom subject:', error);
                    reject(error);
                  },
                },
              );
            }),
          );
        }

        // Ждем завершения всех обновлений
        await Promise.all(promises);

        // Обновляем исходные значения только после успешного завершения всех операций
        initialValues.current = { ...data };
        console.log('All updates completed successfully');
      } catch (error) {
        console.error('Failed to update classroom:', error);
        // Здесь можно добавить уведомление пользователю об ошибке
      }
    },
    [classroom?.id, updateClassroomStatus, updateIndividualClassroom],
  );

  // Обновляем исходные значения когда данные загружаются
  useEffect(() => {
    if (classroom?.status) {
      initialValues.current = { status: classroom.status, subject: classroom?.subject_id || null };
      form.setValue('status', classroom.status);
      form.setValue('subject', classroom?.subject_id || null);
    }
  }, [classroom?.status, classroom?.subject_id, form]);

  // Автоматический submit при изменении любого поля
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && value[name as keyof FormData] !== initialValues.current[name as keyof FormData]) {
        onSubmit(value as FormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onSubmit]);

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="order-2 flex h-full w-full flex-1 justify-center md:order-1">
        <Editor />
      </div>

      <div className="order-1 w-full md:order-2 md:w-[300px]">
        <Form {...form}>
          <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-m-base dark:text-gray-100">Статус занятий</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="dark:text-gray-80 h-[32px] w-full">
                        <SelectValue className="w-full" placeholder="Статус занятий" />
                      </SelectTrigger>
                      <SelectContent className="dark:text-gray-80 w-full">
                        <SelectItem value="active">Учится</SelectItem>
                        <SelectItem value="paused">На паузе</SelectItem>
                        <SelectItem value="finished">Обучение завершено</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Предмет</FormLabel>
                  <FormControl>
                    <Autocomplete field={field} disabled={isUpdatingIndividualClassroom} />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};
