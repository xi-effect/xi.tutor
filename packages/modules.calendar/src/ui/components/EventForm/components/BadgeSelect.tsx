import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@xipkg/select';

import type { FC } from 'react';

interface Option {
  value: string;
  label: string;
}

interface BadgeSelectProps {
  field: {
    value: string;
    icon: React.ReactNode;
    onChange: (value: string) => void;
  };
  options: {
    positive: Option;
    negative: Option;
  };
}

export const BadgeSelect: FC<BadgeSelectProps> = ({ field, options }) => {
  return (
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger
        className={`no-arrow w-fit border-none ${field.value === options.positive.value && 'bg-green-20 dark:bg-green-80 dark:text-gray-0 border-transparent text-green-100'} ${field.value === options.negative.value && 'bg-red-20 dark:bg-red-80 dark:text-gray-0 border-transparent text-red-100'} `}
        size="s"
        before={field.icon}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={options.positive.value}>{options.positive.label}</SelectItem>
          <SelectItem value={options.negative.value}>{options.negative.label}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
