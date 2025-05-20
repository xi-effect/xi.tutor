import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@xipkg/select';

import { StatusEducation } from '../types';

export const CabinetFilters = () => {
  const [status, setStatus] = useState<StatusEducation | 'all'>('all');

  const stylesSelectTrigger =
    'w-fit p-0 border-none !border-transparent focus:ring-0 focus:outline-none shadow-none';

  const stylesSelectValue =
    'text-m-base w-fit p-0 border-none !border-transparent focus:ring-0 focus:outline-none shadow-none';

  return (
    <div className="flex flex-row items-center gap-5">
      <div className="flex flex-row items-center gap-1 bg-red-500">
        <div className="text-gray-60 text-m-base">Статус:</div>

        <Select
          value={status}
          defaultValue="all"
          onValueChange={(value) => setStatus(value as StatusEducation | 'all')}
        >
          <SelectTrigger className={stylesSelectTrigger}>
            <SelectValue placeholder={status} className={stylesSelectValue} />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Любой</SelectItem>
              <SelectItem value="study">Учится</SelectItem>
              <SelectItem value="pause">На паузе</SelectItem>
              <SelectItem value="completed">Обучение завершено</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
