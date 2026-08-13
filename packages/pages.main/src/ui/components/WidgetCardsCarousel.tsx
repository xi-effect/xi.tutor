import { type ReactNode } from 'react';
import { ScrollArea } from '@xipkg/scrollarea';
import { cn } from '@xipkg/utils';
import { galleryShadowPadClass } from './galleryShadowClass';

type WidgetCardsCarouselProps = {
  children: ReactNode;
  className?: string;
};

/** Горизонтальный ряд карточек виджета: одна вёрстка у кабинетов, оплат и материалов. */
export const WidgetCardsCarousel = ({ children, className }: WidgetCardsCarouselProps) => (
  <ScrollArea className="w-full" scrollBarProps={{ orientation: 'horizontal' }}>
    <div
      className={cn('flex w-max flex-row items-stretch gap-4', galleryShadowPadClass, className)}
    >
      {children}
    </div>
  </ScrollArea>
);

export const widgetCardSlotClass = 'flex h-full w-[260px] shrink-0 flex-col xl:w-[280px]';
