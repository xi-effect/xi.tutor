import { ComponentProps } from 'react';
import { cn } from '@xipkg/utils';
import { EMPTY_MATERIALS_PATH } from './emptyMaterialsPath';

type SvgProps = ComponentProps<'svg'>;

export const EmptyMaterials = ({ className, ...props }: SvgProps) => (
  <svg
    width="1120"
    height="656"
    viewBox="0 0 1120 656"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('text-gray-70 dark:text-gray-40', className)}
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d={EMPTY_MATERIALS_PATH} fill="currentColor" />
  </svg>
);
