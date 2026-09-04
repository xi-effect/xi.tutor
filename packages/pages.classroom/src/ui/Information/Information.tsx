import { useForm } from '@xipkg/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@xipkg/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@xipkg/form';

import { useEffect, useRef, useCallback } from 'react';
import { ClassroomT, ClassroomStatusT } from 'common.api';
import {
  useGetNoteStorageItem,
  useUpdateClassroomStatus,
  useUpdateGroupClassroom,
  useUpdateIndividualClassroom,
} from 'common.services';
import { useTranslation } from 'react-i18next';
import { Autocomplete } from './Autocomplete';
import { useParams } from '@tanstack/react-router';
import { InformationNote } from './InformationNote';
import { Button } from '@xipkg/button';
import { StudentsList } from '../Overview/StudentsList';
import { ModalStudentsGroup } from 'features.group.manage';
import { ModalGroupInvite } from 'features.group.invite';
import { sectionTitleClass } from '../sectionTitleClass';
import { galleryShadowHeaderInsetClass } from '../galleryShadowClass';
interface FormData {
  status: ClassroomStatusT;
  subject: number | null;
}

export const Information = ({ classroom }: { classroom: ClassroomT }) => {
  const { t } = useTranslation('classroom');
  const { classroomId = '' } = useParams({ strict: false });

  const { data: note } = useGetNoteStorageItem({
    classroomId: classroomId,
  });

  const { updateGroupClassroom, isUpdating: isUpdatingGroupClassroom } = useUpdateGroupClassroom();
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
      if (!classroom?.id) {
        console.error('Classroom ID is required');
        return;
      }

      try {
        // Проверяем, что изменилось
        const statusChanged = data.status !== initialValues.current.status;
        const subjectChanged = data.subject !== initialValues.current.subject;

        if (!statusChanged && !subjectChanged) {
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
                    resolve(true);
                  },
                  onError: (error) => {
                    reject(error);
                  },
                },
              );
            }),
          );
        }

        if (subjectChanged && classroom.kind === 'group') {
          promises.push(
            new Promise((resolve, reject) => {
              updateGroupClassroom(
                {
                  classroomId: classroom.id,
                  data: { subject_id: data.subject },
                },
                {
                  onSuccess: () => {
                    resolve(true);
                  },
                  onError: (error) => {
                    console.error('Failed to update group classroom:', error);
                    reject(error);
                  },
                },
              );
            }),
          );
        }

        if (subjectChanged && classroom.kind === 'individual') {
          promises.push(
            new Promise((resolve, reject) => {
              updateIndividualClassroom(
                {
                  classroomId: classroom.id,
                  data: { subject_id: data.subject },
                },
                {
                  onSuccess: () => {
                    resolve(true);
                  },
                  onError: (error) => {
                    console.error('Failed to update individual classroom:', error);
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
      } catch (error) {
        console.error('Failed to update classroom:', error);
        // Здесь можно добавить уведомление пользователю об ошибке
      }
    },
    [
      classroom?.id,
      classroom?.kind,
      updateClassroomStatus,
      updateIndividualClassroom,
      updateGroupClassroom,
    ],
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
    <div className="flex min-h-0 flex-1 flex-col gap-8 pt-2">
      {classroom.kind === 'group' ? (
        <div className="flex flex-col gap-4">
          <div className={galleryShadowHeaderInsetClass}>
            <div className="flex w-full min-w-0 flex-row flex-wrap items-center gap-2">
              <h2 className={sectionTitleClass}>{t('information.students')}</h2>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <ModalStudentsGroup>
                  <Button
                    variant="ghost"
                    className="!h-auto rounded-[10px] px-5 py-3 text-base leading-5 font-medium"
                    data-umami-event="classroom-add-student"
                  >
                    {t('actions.addStudent')}
                  </Button>
                </ModalStudentsGroup>
                <ModalGroupInvite>
                  <Button
                    variant="ghost"
                    className="!h-auto rounded-[10px] px-5 py-3 text-base leading-5 font-medium"
                    data-umami-event="classroom-invite-to-group"
                  >
                    {t('actions.inviteToGroup')}
                  </Button>
                </ModalGroupInvite>
              </div>
            </div>
          </div>
          <StudentsList classroomId={String(classroom.id || classroomId)} />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
        <div className="order-2 h-full w-full min-w-0 flex-1 md:order-1">
          <InformationNote classroom={classroom} note={note} />
        </div>

        <div className="order-1 w-full md:order-2 md:w-[300px]">
          <Form {...form}>
            <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-m-base dark:text-text-primary">
                      {t('information.lessonStatus')}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="dark:text-text-primary h-[32px] w-full">
                          <SelectValue
                            className="w-full"
                            placeholder={t('information.lessonStatus')}
                          />
                        </SelectTrigger>
                        <SelectContent className="dark:text-text-primary w-full">
                          <SelectItem value="active">{t('information.statusActive')}</SelectItem>
                          <SelectItem value="paused">{t('information.statusPaused')}</SelectItem>
                          <SelectItem value="finished">
                            {t('information.statusFinished')}
                          </SelectItem>
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
                    <FormLabel className="text-m-base dark:text-text-primary">
                      {t('information.subject')}
                    </FormLabel>
                    <FormControl>
                      <Autocomplete
                        field={field}
                        disabled={isUpdatingIndividualClassroom || isUpdatingGroupClassroom}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
