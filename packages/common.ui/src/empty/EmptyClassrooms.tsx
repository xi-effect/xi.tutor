import { ComponentProps } from 'react';
import { cn } from '@xipkg/utils';
import { EMPTY_CLASSROOMS_PATH } from './emptyClassroomsPath';

type SvgProps = ComponentProps<'svg'>;

export const EmptyClassrooms = ({ className, ...props }: SvgProps) => (
  <svg
    width="794"
    height="757"
    viewBox="0 0 794 757"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('text-gray-70 dark:text-gray-40', className)}
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d={EMPTY_CLASSROOMS_PATH} fill="currentColor" />
  </svg>
);
