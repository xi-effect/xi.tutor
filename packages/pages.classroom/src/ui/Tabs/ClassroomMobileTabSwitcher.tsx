import { useState } from 'react';
import { Button } from '@xipkg/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@xipkg/drawer';
import { ChevronSmallBottom } from '@xipkg/icons';
import { cn } from '@xipkg/utils';

const DRAWER_TITLE = 'Раздел кабинета';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? 'Раздел';

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
          'border-border-selected bg-status-info-background hover:border-border-focus hover:bg-action-primary-background-disabled/40 active:bg-action-primary-background-disabled/60 flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-2xl border px-4 shadow-[0_2px_10px_rgba(59,130,246,0.12)] transition-all active:scale-[0.99]',
          drawerOpen && 'border-border-focus bg-action-primary-background-disabled/50',
        )}
        aria-haspopup="dialog"
        aria-expanded={drawerOpen}
        data-umami-event="classroom-open-tab-switcher"
      >
        <span className="text-m-base text-text-primary truncate font-semibold">{activeLabel}</span>
        <ChevronSmallBottom
          className={cn(
            'fill-icon-brand size-5 shrink-0 transition-transform duration-200',
            drawerOpen && 'rotate-180',
          )}
        />
      </Button>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} modal>
        <DrawerContent className="max-h-screen w-full">
          <div className="flex flex-col gap-4 pb-8">
            <DrawerTitle className="text-m-base text-text-primary font-medium">
              {DRAWER_TITLE}
            </DrawerTitle>
            <DrawerDescription className="sr-only">{DRAWER_TITLE}</DrawerDescription>

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
                        'border-border-focus bg-action-primary-background-default hover:bg-action-primary-background-default',
                    )}
                  >
                    <span
                      className={cn(
                        'text-m-base font-medium',
                        isActive ? 'text-text-on-accent' : 'text-text-primary',
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
