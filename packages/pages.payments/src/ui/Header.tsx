import { Button } from '@xipkg/button';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { cn } from '@xipkg/utils';
import { useCurrentUser } from 'common.services';
import { Plus } from '@xipkg/icons';
import { useMemo } from 'react';

const baseTabs = [
  { id: 'invoices', label: 'Журнал оплат' },
  { id: 'templates', label: 'Типы оплат' },
];

interface HeaderProps {
  onCreateInvoice: () => void;
  onCreateTemplate: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Header = ({
  onCreateInvoice,
  onCreateTemplate,
  activeTab,
  onTabChange,
}: HeaderProps) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const tabs = useMemo(
    () => (isTutor ? baseTabs : baseTabs.filter((t) => t.id !== 'templates')),
    [isTutor],
  );

  const isTemplatesTab = activeTab === 'templates';
  const actionLabel = isTemplatesTab ? 'Создать тип оплаты' : 'Создать счёт на оплату';
  const onActionClick = isTemplatesTab ? onCreateTemplate : onCreateInvoice;

  return (
    <div className="inline-flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col items-start justify-start gap-4 sm:flex-row sm:items-center sm:gap-10">
        <h1 className="font-playfair text-text-primary pb-2 text-3xl font-medium sm:text-5xl">
          Контроль оплат
        </h1>

        {tabs.length > 1 && (
          <SwitcherAnimate
            tabs={tabs}
            activeTab={activeTab}
            onChange={onTabChange}
            className="bg-background-subtle !h-auto w-full justify-start gap-0.5 rounded-[10px] p-1 sm:w-auto"
            tabClassName={cn(
              '!h-auto flex-1 items-start justify-start rounded-lg px-4 py-1.5 text-base leading-5 font-medium sm:flex-none',
              'data-[state=inactive]:text-text-secondary data-[state=inactive]:hover:text-text-secondary',
              'data-[state=active]:text-text-primary data-[state=active]:hover:text-text-primary',
            )}
            indicatorClassName="rounded-lg bg-background-surface shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
          />
        )}
      </div>

      {isTutor && (
        <div className="hidden items-center justify-start sm:flex">
          <Button
            variant="primary"
            className="!h-auto gap-2 rounded-[10px] px-5 py-3 text-base leading-5 font-medium"
            onClick={onActionClick}
            data-umami-event={isTemplatesTab ? 'payment-template-create' : 'payment-invoice-create'}
          >
            <Plus className="fill-text-on-accent size-4 shrink-0" />
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
