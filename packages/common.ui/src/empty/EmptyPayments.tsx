import { ComponentProps } from 'react';
import { cn } from '@xipkg/utils';
import { EMPTY_PAYMENTS_PATH } from './emptyPaymentsPath';

type SvgProps = ComponentProps<'svg'>;

export const EmptyPayments = ({ className, ...props }: SvgProps) => (
  <svg
    width="961"
    height="700"
    viewBox="0 0 961 700"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('text-text-secondary dark:text-text-disabled', className)}
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d={EMPTY_PAYMENTS_PATH} fill="currentColor" />
  </svg>
);
