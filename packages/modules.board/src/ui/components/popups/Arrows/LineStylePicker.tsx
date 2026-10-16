import { useState } from 'react';
import { useEditor } from '@ibodr/draw';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { boardMenuSurfaceClass, boardSelectionToolbarButtonClass } from '../../../boardTheme';
import {
  DashedLineIcon,
  DashDotLineIcon,
  DottedLineIcon,
  DoubleLineIcon,
  SolidLineIcon,
  SparseLineIcon,
  WavyLineIcon,
} from './lineStyleIcons';
import { availableLineStyles, type LineStyleId } from './lineStyle';

const ICONS: Record<LineStyleId, () => React.ReactNode> = {
  solid: SolidLineIcon,
  dashed: DashedLineIcon,
  dotted: DottedLineIcon,
  sparse: SparseLineIcon,
  'dash-dot': DashDotLineIcon,
  wavy: WavyLineIcon,
  double: DoubleLineIcon,
};

export const LineStylePicker = ({
  value,
  allowDouble,
  allowWavy,
  onChange,
  className,
}: {
  value: string | null;
  allowDouble: boolean;
  allowWavy: boolean;
  onChange: (style: LineStyleId) => void;
  className?: string;
}) => {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  const styles = availableLineStyles.filter((style) => {
    if (style === 'double' && !allowDouble) return false;
    if (style === 'wavy' && !allowWavy) return false;
    return true;
  });
  const selected = value && styles.includes(value as LineStyleId) ? (value as LineStyleId) : null;
  const TriggerIcon = ICONS[selected ?? 'solid'];

  const stopBoardPointer = (event: React.PointerEvent) => {
    editor.markEventAsHandled(event);
    event.stopPropagation();
    // Нативный stop нужен отдельно: React-делегирование не всегда
    // останавливает всплытие до document, где поповер инструмента
    // считает клик «снаружи» и закрывается.
    event.nativeEvent.stopPropagation();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="none"
          size="s"
          className={cn(boardSelectionToolbarButtonClass, className)}
          aria-label={t('lineStyle.label')}
          title={selected ? t(`lineStyle.${selected}`) : t('lineStyle.label')}
          onPointerDown={stopBoardPointer}
        >
          <span className="flex size-6 items-center justify-center [&_svg]:size-6">
            <TriggerIcon />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        className={cn(boardMenuSurfaceClass, 'z-60 flex min-w-44 flex-col gap-0.5 rounded-xl p-1')}
        onPointerDown={stopBoardPointer}
      >
        {styles.map((style) => {
          const Icon = ICONS[style];
          const isActive = style === selected;
          return (
            <DropdownMenuItem
              key={style}
              className={cn(
                'text-text-primary flex items-center gap-2 rounded-lg px-2',
                '[&_svg]:fill-none [&_svg]:stroke-current',
                isActive &&
                  'bg-status-info-background text-text-link hover:bg-status-info-background hover:text-text-link font-medium',
              )}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                // Поповер инструмента закрывается на pointerdown снаружи и
                // снимает это меню раньше click, поэтому onSelect не успевает.
                onChange(style);
              }}
              onSelect={() => onChange(style)}
            >
              <span className="flex size-6 shrink-0 items-center justify-center [&_svg]:size-6">
                <Icon />
              </span>
              <span className="min-w-0 flex-1">{t(`lineStyle.${style}`)}</span>
              {isActive ? (
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
                  <path
                    d="M3.5 8.2 L6.4 11.1 L12.5 4.8"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span className="size-4 shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
