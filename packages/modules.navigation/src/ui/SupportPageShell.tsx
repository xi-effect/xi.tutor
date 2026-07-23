import { ReactNode } from 'react';
import { cn } from '@xipkg/utils';
import { SupportFooter } from './SupportFooter';

type SupportPageShellProps = {
  children: ReactNode;
  className?: string;
};

export const SupportPageShell = ({ children, className }: SupportPageShellProps) => {
  return (
    <div className={cn('bg-gray-0 h-dvh w-full overflow-y-auto overscroll-contain', className)}>
      <div className="flex min-h-dvh flex-col">
        {children}
        <SupportFooter />
      </div>
    </div>
  );
};
