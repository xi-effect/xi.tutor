import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@xipkg/select';

import { StatusEducationT, TypeEducationT, SubjectT } from '../types';

export const Filters = ({ className }: { className?: string }) => {
  const [status, setStatus] = useState<StatusEducationT | 'all'>('all');
  const [type, setType] = useState<TypeEducationT | 'all'>('all');
  const [subject, setSubject] = useState<SubjectT | 'all'>('all');

  const stylesSelectTrigger =
    'w-fit p-0 border-none !border-transparent focus:ring-0 focus:outline-none shadow-none';

  const stylesSelectValue =
    'border-none !border-transparent focus:ring-0 focus:outline-none shadow-none';

  return (
    <div className={`flex flex-row items-center gap-5 ${className || ''}`}>
      <div className="flex flex-row items-center gap-2">
        <span className="text-gray-60 text-m-base">Статус:</span>

        <Select
          value={status}
          defaultValue="all"
          onValueChange={(value) => setStatus(value as StatusEducationT | 'all')}
        >
          <SelectTrigger className={stylesSelectTrigger} size="l">
            <SelectValue placeholder={status} className={stylesSelectValue} />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Любой</SelectItem>
              <SelectItem value="active">Активен</SelectItem>
              <SelectItem value="paused">На паузе</SelectItem>
              <SelectItem value="locked">Заблокирован</SelectItem>
              <SelectItem value="finished">Завершен</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-row items-center gap-2">
        <span className="text-gray-60 text-m-base">Тип занятия:</span>

        <Select
          value={type}
          defaultValue="all"
          onValueChange={(value) => setType(value as TypeEducationT | 'all')}
        >
          <SelectTrigger className={stylesSelectTrigger} size="l">
            <SelectValue placeholder={type} className={stylesSelectValue} />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Любой</SelectItem>
              <SelectItem value="individual">Индивидуальное</SelectItem>
              <SelectItem value="group">Групповое</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-row items-center gap-2">
        <span className="text-gray-60 text-m-base">Предмет:</span>

        <Select
          value={subject}
          defaultValue="all"
          onValueChange={(value) => setSubject(value as SubjectT | 'all')}
        >
          <SelectTrigger className={stylesSelectTrigger} size="l">
            <SelectValue placeholder={subject} className={stylesSelectValue} />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Любой</SelectItem>
              <SelectItem value="math">Математика</SelectItem>
              <SelectItem value="computer_science">Информатика</SelectItem>
              <SelectItem value="foreign_languages">Иностранные языки</SelectItem>
              <SelectItem value="other">Другое</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
