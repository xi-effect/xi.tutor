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

import { students } from '../../../../../mocks';

import type { FC } from 'react';

interface LessonBlockProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  handleStudentChange: (newId: string) => void;
}

export const LessonBlock: FC<LessonBlockProps> = ({ control, handleStudentChange }) => {
  return (
    <div className="border-gray-10 w-full border-t border-b py-2">
      <h3 className="mb-2 text-sm">Кабинет</h3>

      <FormField
        control={control}
        name="studentId"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Select value={field.value} onValueChange={(value) => handleStudentChange(value)}>
                <SelectTrigger
                  before={<Account className="h-4 w-4" />}
                  size="s"
                  className="mb-2 w-full border-none outline-none"
                >
                  <SelectValue placeholder="Студент или группа" />
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
                placeholder="Предмет"
                className="mb-2 w-full border-none outline-none"
                before={<Updates className="h-4 w-4" />}
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
                  before={<Payments className="h-4 w-4" />}
                  size="s"
                  className="mb-2 w-full border-none outline-none"
                >
                  <SelectValue placeholder="Тип занятия" />
                </SelectTrigger>
                <SelectContent className="w-full max-w-[300px]">
                  <SelectGroup>
                    <SelectItem value="group">Групповое</SelectItem>
                    <SelectItem value="individual">Индивидуальное</SelectItem>
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
                placeholder="Описание"
                className="w-full border-none outline-none"
                before={<Hint className="h-4 w-4" />}
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
