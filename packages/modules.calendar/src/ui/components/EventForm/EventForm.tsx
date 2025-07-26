// import { cn } from '@xipkg/utils';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@xipkg/select';
import { Button } from '@xipkg/button';
import { Switch } from '@xipkg/switcher';
import { Input } from '@xipkg/input';
import { useMaskInput } from '@xipkg/inputmask';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { ArrowRight, Clock, MenuDots, Redo, Account, Updates, Payments, Hint } from '@xipkg/icons';

import { useMemo, useState, type FC } from 'react';
import type { ICalendarEvent } from '../../types';

interface EventFormProps {
  calendarEvent?: ICalendarEvent;
}

export const students = [
  {
    id: crypto.randomUUID(),
    name: 'Анна Смирнова (Групповое • Practice english)',
    subject: {
      id: crypto.randomUUID(),
      name: 'Английский язык',
      variant: 'Занятие на 40 минут',
      pricePerLesson: 600,
      unpaidLessonsAmount: 1,
    },
  },
  {
    id: crypto.randomUUID(),
    name: 'Максим Иванов',
    subject: {
      id: crypto.randomUUID(),
      name: 'Математика',
      variant: 'Занятие на 60 минут',
      pricePerLesson: 1000,
    },
  },
];

export const EventForm: FC<EventFormProps> = ({ calendarEvent }) => {
  const [eventType, setEventType] = useState<ICalendarEvent['type']>('rest');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId),
    [selectedStudentId],
  );

  const handleSubmit = () => {
    console.log('submit');
  };

  const maskRefStartTime = useMaskInput('time');
  const maskRefEndTime = useMaskInput('time');

  return (
    <div className="w-full px-2">
      <div className="flex w-full items-center justify-between gap-2">
        <Select
          value={calendarEvent?.type}
          defaultValue={eventType}
          onValueChange={(value) => setEventType(value as ICalendarEvent['type'])}
          // onChange={(value) => updateField('eventType', value as EventType)}
        >
          <SelectTrigger className="border-none" size="s">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="lesson">Занятие</SelectItem>
              <SelectItem value="rest">Отдых</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger className="bg-gray-0 flex h-8 w-8 items-center justify-center text-sm">
            <MenuDots className="rotate-90" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Вырезать</DropdownMenuItem>
            <DropdownMenuItem>Копировать</DropdownMenuItem>
            <DropdownMenuItem>Дублировать</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-80">Удалить</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Название */}
      <Input
        className="mt-2 border-none outline-none"
        // value={formData.title}
        // onChange={(value) => updateField('title', value)}
        placeholder="Введите название"
        // error={errors.title}
      />

      {eventType === 'lesson' && (
        <div className="border-gray-10 w-full border-t border-b py-2">
          <h3 className="mb-2 text-sm">Кабинет</h3>

          <Select>
            <SelectTrigger
              before={<Account className="h-4 w-4" />}
              size="s"
              className="mb-2 w-full border-none outline-none"
              value={selectedStudent?.name}
              onValueChange={(value: string) => setSelectedStudentId(value)}
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
          <Input
            value={selectedStudent?.subject.name}
            placeholder="Предмет"
            className="mb-2 w-full border-none outline-none"
            before={<Updates className="h-4 w-4" />}
            variant="s"
          />
          <Select>
            <SelectTrigger
              before={<Payments className="h-4 w-4" />}
              size="s"
              className="mb-2 w-full border-none outline-none"
              value={selectedStudent?.name}
              onValueChange={(value: string) => setSelectedStudentId(value)}
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
          <Input
            value=""
            placeholder="Описание"
            className="w-full border-none outline-none"
            before={<Hint className="h-4 w-4" />}
            variant="s"
          />
        </div>
      )}

      <div className="border-gray-10 border-t border-b py-2">
        <h3 className="mb-2 text-sm">Время</h3>

        <div className="mb-4 flex items-center gap-2">
          <Input
            ref={maskRefStartTime}
            value={calendarEvent?.start?.toLocaleTimeString()}
            // onChange={(value) => handleTimeChange('startTime', value)}
            placeholder="00:00"
            before={<Clock className="h-4 w-4" />}
            variant="s"
            className="border-none outline-none"
            // error={errors.startTime}
          />

          <div className="flex items-center gap-2">
            <Input
              ref={maskRefEndTime}
              value={calendarEvent?.end.toLocaleTimeString()}
              // onChange={(value) => handleTimeChange('endTime', value)}
              placeholder="00:00"
              before={<ArrowRight className="h-4 w-4" />}
              variant="s"
              className="border-none outline-none"
              // error={errors.endTime}
            />
            <span className="shrink-0 text-sm">1ч 20м</span>
          </div>
        </div>

        {/* Дата */}
        {/* <div className="mb-4">
            <Input
              value={formData.date}
              onChange={(value) => updateField('date', formatDate(value))}
              placeholder="Выберите дату"
              icon={<Calendar className="w-4 h-4" />}
              error={errors.date}
            />
          </div> */}

        {/* Весь день */}
        <div className="flex items-center gap-2">
          <Switch id="all-day-mode" />
          <label htmlFor="all-day-mode" className="text-sm font-medium">
            Весь день
          </label>
        </div>

        {/* Повторять */}
        <div className="mt-2 flex items-center gap-2 px-2 py-1">
          <Redo className="h-4 w-4" />
          <span className="text-gray-30 text-sm">Повторять</span>
        </div>

        {/* Кнопки */}
        <div className="flex w-full justify-between gap-4 pt-2">
          <Button size="s" variant="secondary" className="w-full">
            Отмена
          </Button>
          <Button size="s" onClick={handleSubmit} className="w-full">
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
};
