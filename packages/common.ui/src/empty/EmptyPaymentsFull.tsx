import { ComponentProps } from 'react';
import { cn } from '@xipkg/utils';
import { EMPTY_PAYMENTS_FULL_PATH } from './emptyPaymentsFullPath';

type SvgProps = ComponentProps<'svg'>;

export const EmptyPaymentsFull = ({ className, ...props }: SvgProps) => (
  <svg
    width="443"
    height="393"
    viewBox="0 0 443 393"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('text-text-secondary dark:text-text-disabled', className)}
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d={EMPTY_PAYMENTS_FULL_PATH} fill="currentColor" />
  </svg>
);
