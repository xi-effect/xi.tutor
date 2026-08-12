import { type ReactNode } from 'react';
import { cn } from '@xipkg/utils';

/** Заголовок виджета главной: Playfair, без surface-подложки. */
export const widgetTitleClass =
  'font-playfair text-text-primary m-0 shrink-0 text-2xl font-medium sm:text-3xl';

type WidgetHeaderProps = {
  title: ReactNode;
  actions?: ReactNode;
  /** Доп. контент рядом с заголовком (фильтры и т.п.) */
  children?: ReactNode;
  className?: string;
};

export const WidgetHeader = ({ title, actions, children, className }: WidgetHeaderProps) => (
  <div className={cn('flex w-full min-w-0 flex-row flex-wrap items-center gap-2', className)}>
    {typeof title === 'string' ? <h2 className={widgetTitleClass}>{title}</h2> : title}
    {children}
    {actions ? <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div> : null}
  </div>
);
