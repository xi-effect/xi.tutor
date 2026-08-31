import { Tabs } from '@xipkg/tabs';
import { Overview } from '../Overview';
import { Materials } from '../Materials';
import { ClassroomFilesPage } from '../Files/ClassroomFilesPage';
import { Calendar } from '../Calendar';
import { Payments } from '../Payments';
import { useParams } from '@tanstack/react-router';

interface SharedTabsContentProps {
  extraContent?: React.ReactNode;
}

const ClassroomFilesTab = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  return <ClassroomFilesPage classroomId={classroomId} />;
};

export const SharedTabsContent = ({ extraContent }: SharedTabsContentProps) => (
  <>
    <Tabs.Content
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pr-3 outline-none data-[state=inactive]:hidden"
      value="overview"
    >
      <Overview />
    </Tabs.Content>

    <Tabs.Content
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
      value="materials"
    >
      <Materials />
    </Tabs.Content>

    <Tabs.Content
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
      value="files"
    >
      <ClassroomFilesTab />
    </Tabs.Content>

    <Tabs.Content
      className="flex min-h-0 flex-1 flex-col outline-none data-[state=inactive]:hidden"
      value="schedule"
    >
      <Calendar />
    </Tabs.Content>

    <Tabs.Content
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pr-3 data-[state=inactive]:hidden"
      value="payments"
    >
      <Payments />
    </Tabs.Content>

    {extraContent}
  </>
);
