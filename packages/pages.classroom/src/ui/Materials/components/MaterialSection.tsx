import type { ReactNode } from 'react';
import { ScrollArea } from '@xipkg/scrollarea';
import { cn } from '@xipkg/utils';
import { MaterialHeader } from './MaterialHeader';

type MaterialsHorizontalSectionProps = {
  children: ReactNode;
  headerTitle: string;
  rowClassName?: string;
};

export const MaterialSection = ({
  headerTitle,
  rowClassName,
  children,
}: MaterialsHorizontalSectionProps) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <MaterialHeader title={headerTitle} />
      <div className="flex flex-row">
        <ScrollArea
          className="h-[150px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
          scrollBarProps={{ orientation: 'horizontal' }}
        >
          <div className={cn('flex flex-row gap-8', rowClassName)}>{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
};
