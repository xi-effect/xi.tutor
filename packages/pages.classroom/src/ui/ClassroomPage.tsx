import { cn, useMediaQuery } from '@xipkg/utils';
import { Header } from './Header';
import { Tabs } from './Tabs';
import { ClassroomScheduleRoot } from './Calendar/ClassroomScheduleRoot';

export const ClassroomPage = () => {
  const isMobile = useMediaQuery('(max-width: 960px)');

  return (
    <ClassroomScheduleRoot>
      <div
        className={cn(
          'bg-background-page flex flex-col gap-4',
          isMobile ? 'max-h-[calc(100dvh-64px)]' : 'h-screen',
        )}
      >
        <Header />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Tabs />
        </div>
      </div>
    </ClassroomScheduleRoot>
  );
};
