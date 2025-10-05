import { ReactNode } from 'react';
import { SectionHeader } from './SectionHeader';
import { ScrollArea } from '@xipkg/scrollarea';

type SectionContainerPropsT = {
  title: string;
  tabLink: string;
  children: ReactNode;
};

export const SectionContainer = ({ title, tabLink, children }: SectionContainerPropsT) => (
  <div className="flex flex-col gap-4 p-4">
    <SectionHeader title={title} tabLink={tabLink} />
    <div className="flex flex-row">
      <ScrollArea
        className="h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
        scrollBarProps={{ orientation: 'horizontal' }}
      >
        {children}
      </ScrollArea>
    </div>
  </div>
);
