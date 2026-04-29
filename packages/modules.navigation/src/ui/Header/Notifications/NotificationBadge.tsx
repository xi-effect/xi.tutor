import { cn } from '@xipkg/utils';

interface NotificationBadgeProps {
  count: number | string;
  className?: string;
  /**
   * `mobile` — бейдж в углу иконки (сейчас не используется).
   * `sidebar` — только пункт «Уведомления» в сайдбаре (`NotificationsDropdown`), бейдж в строке меню.
   */
  variant?: 'mobile' | 'sidebar';
}

const pillClassName =
  'text-xxs-base-size items-center justify-center bg-(--xi-pink-20) font-medium leading-none tabular-nums text-(--xi-pink-60)';

/** Счётчик непрочитанных в бейдже `--xi-pink-20` / `--xi-pink-60` */
export const NotificationBadge = ({
  count,
  className,
  variant = 'mobile',
}: NotificationBadgeProps) => {
  if (count === 0 || count === '0') return null;

  if (variant === 'sidebar') {
    /* div, не span: у SidebarMenuButton есть [&>span:last-child]:truncate — последний span получил бы truncate */
    return (
      <div
        className={cn(
          pillClassName,
          'inline-flex w-fit min-w-6 shrink-0 rounded-lg bg-(--xi-pink-20) px-2 text-[12px] text-(--xi-pink-60)',
          className,
        )}
        style={{ height: 24, minHeight: 24, boxSizing: 'border-box' }}
      >
        {count}
      </div>
    );
  }

  return (
    <div
      className={cn(
        pillClassName,
        'pointer-events-none absolute top-0 right-0 flex h-6 min-h-6 w-fit min-w-6 rounded-lg px-2 py-1',
        className,
      )}
    >
      {count}
    </div>
  );
};
