import { Tabs } from '@xipkg/tabs';
import { Materials } from '../Materials';
import { Calendar } from '../Calendar';
import { Payments } from '../Payments';
import { isClassroomMaterialTab } from './useTabNavigation';

interface SharedTabsContentProps {
  currentTab: string;
  onOpenInvoiceModal?: () => void;
  extraContent?: React.ReactNode;
}

export const SharedTabsContent = ({
  currentTab,
  onOpenInvoiceModal,
  extraContent,
}: SharedTabsContentProps) => (
  <>
    {isClassroomMaterialTab(currentTab) ? (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Materials />
      </div>
    ) : null}

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
      <Payments onOpenInvoiceModal={onOpenInvoiceModal} />
    </Tabs.Content>

    {extraContent}
  </>
);
