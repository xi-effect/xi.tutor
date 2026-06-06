import { useState } from 'react';
import { Button } from '@xipkg/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@xipkg/drawer';
import { ChevronSmallBottom } from '@xipkg/icons';
import { cn } from '@xipkg/utils';

const DRAWER_TITLE = 'Раздел кабинета';

const menuRowClassName = cn(
  'border-gray-10 bg-gray-0 hover:bg-gray-5 flex w-full items-center rounded-xl border px-4 py-3 text-left transition-colors',
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
          'border-brand-20 bg-brand-0 hover:border-brand-40 hover:bg-brand-20/40 active:bg-brand-20/60 flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-2xl border px-4 shadow-[0_2px_10px_rgba(59,130,246,0.12)] transition-all active:scale-[0.99]',
          drawerOpen && 'border-brand-40 bg-brand-20/50',
        )}
        aria-haspopup="dialog"
        aria-expanded={drawerOpen}
        data-umami-event="classroom-open-tab-switcher"
      >
        <span className="text-m-base truncate font-semibold text-gray-100">{activeLabel}</span>
        <ChevronSmallBottom
          className={cn(
            'fill-brand-80 size-5 shrink-0 transition-transform duration-200',
            drawerOpen && 'rotate-180',
          )}
        />
      </Button>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} modal>
        <DrawerContent className="max-h-screen w-full">
          <div className="flex flex-col gap-4 pb-8">
            <DrawerTitle className="text-m-base font-medium text-gray-100">
              {DRAWER_TITLE}
            </DrawerTitle>
            <DrawerDescription className="sr-only">{DRAWER_TITLE}</DrawerDescription>

            <div className="dark:bg-gray-0 flex flex-col gap-3">
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
                      isActive && 'border-brand-40 bg-brand-80 hover:bg-brand-80',
                    )}
                  >
                    <span
                      className={cn(
                        'text-m-base font-medium',
                        isActive ? 'text-brand-0' : 'text-gray-100',
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
