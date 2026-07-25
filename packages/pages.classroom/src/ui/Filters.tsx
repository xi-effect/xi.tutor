import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@xipkg/select';
import { useTranslation } from 'react-i18next';

import { StatusEducationT, TypeEducationT, SubjectT } from '../types';

export const Filters = ({ className }: { className?: string }) => {
  const { t } = useTranslation('classroom');
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
        <span className="text-text-secondary text-m-base">{t('filters.status')}</span>

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
              <SelectItem value="all">{t('filters.any')}</SelectItem>
              <SelectItem value="active">{t('filters.active')}</SelectItem>
              <SelectItem value="paused">{t('filters.paused')}</SelectItem>
              <SelectItem value="locked">{t('filters.locked')}</SelectItem>
              <SelectItem value="finished">{t('filters.finished')}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-row items-center gap-2">
        <span className="text-text-secondary text-m-base">{t('filters.lessonType')}</span>

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
              <SelectItem value="all">{t('filters.any')}</SelectItem>
              <SelectItem value="individual">{t('filters.individual')}</SelectItem>
              <SelectItem value="group">{t('filters.group')}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-row items-center gap-2">
        <span className="text-text-secondary text-m-base">{t('filters.subject')}</span>

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
              <SelectItem value="all">{t('filters.any')}</SelectItem>
              <SelectItem value="math">{t('filters.math')}</SelectItem>
              <SelectItem value="computer_science">{t('filters.computerScience')}</SelectItem>
              <SelectItem value="foreign_languages">{t('filters.foreignLanguages')}</SelectItem>
              <SelectItem value="other">{t('filters.other')}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
