import { Tabs } from '@xipkg/tabs';
import { Overview } from '../Overview';
import { Materials } from '../Materials';
import { Calendar } from '../Calendar';
import { Payments } from '../Payments';

interface SharedTabsContentProps {
  /** Дополнительные Tabs.Content — специфичные для конкретной роли */
  extraContent?: React.ReactNode;
}

export const SharedTabsContent = ({ extraContent }: SharedTabsContentProps) => (
  <>
    <Tabs.Content value="overview">
      <Overview />
    </Tabs.Content>

    <Tabs.Content value="materials">
      <Materials />
    </Tabs.Content>

    <Tabs.Content className="flex min-h-0 flex-1 flex-col outline-none" value="schedule">
      <Calendar />
    </Tabs.Content>

    <Tabs.Content value="payments">
      <Payments />
    </Tabs.Content>

    {extraContent}
  </>
);
