import { useTranslation } from 'react-i18next';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
} from '@xipkg/select';
import { Redo } from '@xipkg/icons';
import { useConstants } from '../../../../hooks';

import type { FC } from 'react';

interface RepeatBlockProps {
  value: string;
  onChange: (value: string) => void;
}

export const RepeatBlock: FC<RepeatBlockProps> = ({ value, onChange }) => {
  const { t } = useTranslation('calendar');
  const { repeatVariants } = useConstants();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="no-arrow text-gray-80 w-fit border-none"
        size="s"
        before={<Redo className="fill-gray-80 h-4 w-4" />}
      >
        <SelectValue placeholder={t('event_form.repeat')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={repeatVariants[0].value} className="text-gray-80">
            {repeatVariants[0].label}
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          {repeatVariants.slice(1).map((variant) => (
            <SelectItem key={variant.value} value={variant.value} className="text-gray-80">
              {variant.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
