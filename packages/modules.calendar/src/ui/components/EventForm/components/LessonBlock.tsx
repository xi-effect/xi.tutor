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
import { useForm } from '@xipkg/form';
import type { EventFormData, EventFormInput } from '../../../../model';

type LessonBlockProps = {
  form: ReturnType<typeof useForm<EventFormInput, unknown, EventFormData>>;
};

export const LessonBlock: FC<LessonBlockProps> = ({ form }) => {
  const { t } = useTranslation('calendar');
  const { control, handleStudentChange } = useLessonFields(form);

  const onChangeStudent = (newId: string) => {
    const selectedStudent = students.find((student) => student.id === newId);
    if (selectedStudent) handleStudentChange(selectedStudent);
  };

  return (
    <div className="border-border-default w-full border-t border-b py-2">
      <h3 className="mb-2 text-sm">{t('event_form.class')}</h3>

      <FormField
        control={control}
        name="studentId"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Select value={field.value} onValueChange={onChangeStudent}>
                <SelectTrigger
                  before={<Account className="fill-icon-primary h-4 w-4" />}
                  size="s"
                  className="hover:border-border-strong focus:border-border-strong mb-2 w-full border border-transparent outline-none"
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
                className="hover:border-border-strong focus:border-border-strong mb-2 w-full border border-transparent outline-none"
                before={<Updates className="fill-icon-primary h-4 w-4" />}
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
                  before={<Payments className="fill-icon-primary h-4 w-4" />}
                  size="s"
                  className="hover:border-border-strong focus:border-border-strong mb-2 w-full border border-transparent outline-none"
                >
                  <SelectValue placeholder={t('event_form.lesson_type')} />
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
                className="hover:border-border-strong focus:border-border-strong w-full border border-transparent outline-none"
                before={<Hint className="fill-icon-primary h-4 w-4" />}
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
