import { useTranslation } from 'react-i18next';
import { FormControl, FormField, FormItem, FormMessage } from '@xipkg/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@xipkg/select';
import { Input } from '@xipkg/input';
import { Account, Updates, Payments, Hint } from '@xipkg/icons';

import { students } from '../../../../mocks';
import { useLessonFields } from '../../../../hooks/useEventForm';

import type { FC } from 'react';
import type { useForm } from '@xipkg/form';
import type { EventFormData } from '../../../../model';

interface LessonBlockProps {
  form: ReturnType<typeof useForm<EventFormData>>;
}

export const LessonBlock: FC<LessonBlockProps> = ({ form }) => {
  const { t } = useTranslation('calendar');
  const { control, handleStudentChange } = useLessonFields(form);

  const onChangeStudent = (newId: string) => {
    const selectedStudent = students.find((student) => student.id === newId);
    if (selectedStudent) handleStudentChange(selectedStudent);
  };

  return (
    <div className="border-gray-10 w-full border-t border-b py-2">
      <h3 className="mb-2 text-sm">{t('event_form.class')}</h3>

      <FormField
        control={control}
        name="studentId"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Select value={field.value} onValueChange={onChangeStudent}>
                <SelectTrigger
                  before={<Account className="fill-gray-80 h-4 w-4" />}
                  size="s"
                  className="mb-2 w-full border border-transparent outline-none hover:border-gray-100 focus:border-gray-100"
                >
                  <SelectValue placeholder={t('event_form.student')} />
                </SelectTrigger>
                <SelectContent className="w-full max-w-[300px]">
                  <SelectGroup>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="subjectName"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                {...field}
                value={field.value}
                placeholder={t('event_form.subject')}
                className="mb-2 w-full border border-transparent outline-none hover:border-gray-100 focus:border-gray-100"
                before={<Updates className="fill-gray-80 h-4 w-4" />}
                variant="s"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="lessonType"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  before={<Payments className="fill-gray-80 h-4 w-4" />}
                  size="s"
                  className="mb-2 w-full border border-transparent outline-none hover:border-gray-100 focus:border-gray-100"
                >
                  <SelectValue placeholder="Тип занятия" />
                </SelectTrigger>
                <SelectContent className="w-full max-w-[300px]">
                  <SelectGroup>
                    <SelectItem value="group">{t('event_form.lesson_group')}</SelectItem>
                    <SelectItem value="individual">{t('event_form.lesson_individual')}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                {...field}
                placeholder={t('event_form.description')}
                className="w-full border border-transparent outline-none hover:border-gray-100 focus:border-gray-100"
                before={<Hint className="fill-gray-80 h-4 w-4" />}
                variant="s"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
