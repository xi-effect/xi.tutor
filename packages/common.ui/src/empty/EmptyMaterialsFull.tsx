import { ComponentProps } from 'react';
import { cn } from '@xipkg/utils';
import { EMPTY_MATERIALS_FULL_PATH } from './emptyMaterialsFullPath';

type SvgProps = ComponentProps<'svg'>;

export const EmptyMaterialsFull = ({ className, ...props }: SvgProps) => (
  <svg
    width="407"
    height="200"
    viewBox="0 0 407 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('text-text-secondary dark:text-text-disabled', className)}
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d={EMPTY_MATERIALS_FULL_PATH} fill="currentColor" />
  </svg>
);
