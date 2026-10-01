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
  DottedLineIcon,
  DoubleLineIcon,
  SolidLineIcon,
  SparseLineIcon,
} from './lineStyleIcons';
import { availableLineStyles, type LineStyleId } from './lineStyle';

const ICONS: Record<LineStyleId, () => React.ReactNode> = {
  solid: SolidLineIcon,
  dashed: DashedLineIcon,
  dotted: DottedLineIcon,
  sparse: SparseLineIcon,
  double: DoubleLineIcon,
};

export const LineStylePicker = ({
  value,
  allowDouble,
  onChange,
  className,
}: {
  value: string | null;
  allowDouble: boolean;
  onChange: (style: LineStyleId) => void;
  className?: string;
}) => {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  const styles = allowDouble
    ? availableLineStyles
    : availableLineStyles.filter((style) => style !== 'double');
  const selected = value && styles.includes(value as LineStyleId) ? (value as LineStyleId) : null;
  const TriggerIcon = ICONS[selected ?? 'solid'];

  const stopBoardPointer = (event: React.PointerEvent) => {
    editor.markEventAsHandled(event);
    event.stopPropagation();
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
          <span className="flex w-5 items-center justify-center [&_svg]:h-3 [&_svg]:w-5">
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
                isActive && 'bg-status-info-background',
              )}
              onSelect={() => onChange(style)}
            >
              <span className="flex w-7 shrink-0 items-center">
                <Icon />
              </span>
              {t(`lineStyle.${style}`)}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
