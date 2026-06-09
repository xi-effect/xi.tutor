import { ComponentProps } from 'react';
import { cn } from '@xipkg/utils';
import { EMPTY_SCHEDULE_PATH } from './emptySchedulePath';

type SvgProps = ComponentProps<'svg'>;

export const EmptySchedule = ({ className, ...props }: SvgProps) => (
  <svg
    width="880"
    height="653"
    viewBox="0 0 880 653"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('text-gray-70 dark:text-gray-40', className)}
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d={EMPTY_SCHEDULE_PATH} fill="currentColor" />
  </svg>
);
