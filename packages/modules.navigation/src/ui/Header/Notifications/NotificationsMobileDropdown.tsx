import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Notification, Settings } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';

export const NotificationsMobileDropdown = ({
  isOpen,
  onOpenChange,
  onOpenSettings,
  notificationsList,
  hasUnread,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
  notificationsList: React.ReactNode;
  hasUnread: boolean;
}) => {
  const { t } = useTranslation('navigation');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [alignOffset, setAlignOffset] = useState(0);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const triggerCenter = rect.left + rect.width / 2;
      setAlignOffset(window.innerWidth / 2 - triggerCenter);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isOpen]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          variant="none"
          className="text-gray-80 hover:bg-gray-10 focus:bg-gray-10 size-10 shrink-0 rounded-xl"
          aria-label={t('notifications')}
        >
          <span className="relative inline-flex size-6 shrink-0 items-center justify-center">
            <Notification className="fill-gray-80 size-6" size="s" />
            {hasUnread && (
              <span
                className="absolute -top-0.5 -right-0.5 flex h-[10px] w-[10px] items-center justify-center rounded-full bg-[var(--xi-pink-20)]"
                aria-hidden
              >
                <span className="size-[6px] shrink-0 rounded-full bg-[var(--xi-pink-60)]" />
              </span>
            )}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        alignOffset={alignOffset}
        side="top"
        sideOffset={12}
        collisionPadding={16}
        className="flex w-[calc(100vw-32px)] max-w-[480px] flex-col gap-1 rounded-[20px] border-2 px-1 py-1"
      >
        <DropdownMenuLabel className="text-s-base flex h-[48px] items-center p-3 font-semibold text-gray-100">
          {t('notifications')}
          <div className="ml-auto flex items-center gap-1">
            <Button onClick={onOpenSettings} variant="none" className="h-[32px] w-[32px] p-1">
              <Settings className="fill-gray-80 size-6" size="s" />
            </Button>
          </div>
        </DropdownMenuLabel>
        {notificationsList}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
