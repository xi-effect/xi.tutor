import { Button } from '@xipkg/button';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import {
  pageSwitcherIndicatorClass,
  pageSwitcherTabClass,
  pageSwitcherTrackClass,
} from 'common.ui';
import { useCurrentUser } from 'common.services';
import { Plus } from '@xipkg/icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('payments');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: 'invoices', label: t('tabs.invoices') },
      { id: 'analytics', label: t('tabs.analytics') },
      { id: 'templates', label: t('tabs.templates') },
    ];
    return isTutor ? baseTabs : baseTabs.filter((tab) => tab.id === 'invoices');
  }, [isTutor, t]);

  const isTemplatesTab = activeTab === 'templates';
  const isAnalyticsTab = activeTab === 'analytics';
  const actionLabel = isTemplatesTab ? t('actions.createTemplate') : t('actions.createInvoice');
  const onActionClick = isTemplatesTab ? onCreateTemplate : onCreateInvoice;

  return (
    <div className="inline-flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col items-start justify-start gap-4 sm:flex-row sm:items-center sm:gap-10">
        <h1 className="font-playfair text-text-primary pb-2 text-3xl font-medium sm:text-5xl">
          {t('title')}
        </h1>

        {tabs.length > 1 && (
          <SwitcherAnimate
            tabs={tabs}
            activeTab={activeTab}
            onChange={onTabChange}
            className={pageSwitcherTrackClass}
            tabClassName={pageSwitcherTabClass}
            indicatorClassName={pageSwitcherIndicatorClass}
          />
        )}
      </div>

      {isTutor && !isAnalyticsTab && (
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
