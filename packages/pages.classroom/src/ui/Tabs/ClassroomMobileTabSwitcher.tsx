import { useState } from 'react';
import { Button } from '@xipkg/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@xipkg/drawer';
import { ChevronSmallBottom } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

const menuRowClassName = cn(
  'border-border-default bg-background-surface hover:bg-background-page flex w-full items-center rounded-xl border px-4 py-3 text-left transition-colors',
);

type ClassroomTab = {
  id: string;
  label: string;
};

type ClassroomMobileTabSwitcherProps = {
  tabs: ClassroomTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
};

export const ClassroomMobileTabSwitcher = ({
  tabs,
  activeTab,
  onChange,
}: ClassroomMobileTabSwitcherProps) => {
  const { t } = useTranslation('classroom');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerTitle = t('tabs.drawerTitle');
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? t('tabs.section');

  const handleSelect = (tabId: string) => {
    onChange(tabId);
    setDrawerOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setDrawerOpen(true)}
        className={cn(
          'bg-background-subtle hover:bg-background-surface data-[state=open]:bg-background-surface flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-[10px] px-4 transition-all active:scale-[0.99]',
          drawerOpen && 'bg-background-surface',
        )}
        aria-haspopup="dialog"
        aria-expanded={drawerOpen}
        data-umami-event="classroom-open-tab-switcher"
      >
        <span className="text-m-base text-text-primary truncate font-semibold">{activeLabel}</span>
        <ChevronSmallBottom
          className={cn(
            'fill-icon-secondary size-5 shrink-0 transition-transform duration-200',
            drawerOpen && 'rotate-180',
          )}
        />
      </Button>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} modal>
        <DrawerContent className="max-h-screen w-full">
          <div className="flex flex-col gap-4 pb-8">
            <DrawerTitle className="text-m-base text-text-primary font-medium">
              {drawerTitle}
            </DrawerTitle>
            <DrawerDescription className="sr-only">{drawerTitle}</DrawerDescription>

            <div className="dark:bg-background-surface flex flex-col gap-3">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelect(tab.id)}
                    data-umami-event="classroom-switch-tab"
                    data-umami-event-tab={tab.id}
                    className={cn(
                      menuRowClassName,
                      isActive &&
                        'border-border-default bg-background-subtle hover:bg-background-subtle',
                    )}
                  >
                    <span
                      className={cn(
                        'text-m-base font-medium',
                        isActive ? 'text-text-primary' : 'text-text-secondary',
                      )}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
