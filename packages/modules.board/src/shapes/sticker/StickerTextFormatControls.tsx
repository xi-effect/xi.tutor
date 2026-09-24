import { useState } from 'react';
import { AlignCentre, AlignJustify, AlignLeft, AlignRight, Collapse } from '@xipkg/icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@xipkg/dropdown';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@xipkg/select';
import type { DrNoteShape, Editor } from '@ibodr/draw';
import { useTranslation } from 'react-i18next';
import { cn } from '@xipkg/utils';
import { NavbarButton } from '../../ui/components/shared';
import { boardMenuSurfaceClass } from '../../ui/boardTheme';
import {
  applyStickerAlign,
  applyStickerFontSize,
  getCommonValue,
  getStickerAlign,
  getStickerFontSizePx,
  STICKER_ALIGNS,
  STICKER_FONT_SIZES,
  type StickerAlign,
} from './stickerTextStyle';

function fontSizeOptions(current: number | null): number[] {
  if (
    current == null ||
    STICKER_FONT_SIZES.includes(current as (typeof STICKER_FONT_SIZES)[number])
  ) {
    return [...STICKER_FONT_SIZES];
  }
  return [...STICKER_FONT_SIZES, current].sort((left, right) => left - right);
}

const ALIGN_ICONS = {
  start: AlignLeft,
  middle: AlignCentre,
  end: AlignRight,
  justify: AlignJustify,
} as const;

type StickerTextFormatControlsProps = {
  editor: Editor;
  notes: DrNoteShape[];
};

export const StickerTextFormatControls = ({ editor, notes }: StickerTextFormatControlsProps) => {
  const { t } = useTranslation('board');
  const [alignOpen, setAlignOpen] = useState(false);
  if (!notes.length) return null;

  const align = getCommonValue(notes.map(getStickerAlign));
  const fontSize = getCommonValue(notes.map((shape) => getStickerFontSizePx(editor, shape)));
  const AlignIcon = ALIGN_ICONS[align ?? 'middle'];

  const alignTitle: Record<StickerAlign, string> = {
    start: t('toolbar.stickerAlignLeft'),
    middle: t('toolbar.stickerAlignCenter'),
    end: t('toolbar.stickerAlignRight'),
    justify: t('toolbar.stickerAlignJustify'),
  };

  const stopBoardPointer = (event: React.PointerEvent) => {
    editor.markEventAsHandled(event);
    event.stopPropagation();
  };

  return (
    <>
      <DropdownMenu open={alignOpen} onOpenChange={setAlignOpen}>
        <DropdownMenuTrigger asChild>
          <NavbarButton
            icon={<AlignIcon className="size-5" />}
            title={align ? alignTitle[align] : t('toolbar.stickerAlign')}
            isActive={alignOpen}
            onPointerDown={stopBoardPointer}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={8}
          className={cn(boardMenuSurfaceClass, 'z-[60] flex flex-row gap-0.5 rounded-xl p-1')}
          onPointerDown={stopBoardPointer}
        >
          {STICKER_ALIGNS.map((value) => {
            const Icon = ALIGN_ICONS[value];
            return (
              <NavbarButton
                key={value}
                icon={<Icon className="size-5" />}
                title={alignTitle[value]}
                isActive={align === value}
                onClick={() => {
                  applyStickerAlign(editor, value);
                  setAlignOpen(false);
                }}
              />
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <Select
        value={fontSize == null ? undefined : String(fontSize)}
        onValueChange={(value) => applyStickerFontSize(editor, Number(value))}
      >
        <SelectTrigger
          size="s"
          aria-label={t('toolbar.stickerFontSize')}
          title={t('toolbar.stickerFontSize')}
          before={<Collapse className="size-4 shrink-0" />}
          className={cn(
            'text-text-primary h-8 w-auto shrink-0 gap-1 rounded-lg bg-transparent px-1.5 text-sm shadow-none',
            'hover:bg-status-info-background outline-none! hover:outline-none!',
            'focus:outline-none! focus-visible:outline-none!',
            'data-[state=open]:bg-status-info-background data-[state=open]:outline-none!',
            '[&>svg]:hidden',
            '[&>div]:w-auto [&>div]:flex-none',
            '[&_.line-clamp-1]:line-clamp-none! [&_.line-clamp-1]:w-auto [&_.line-clamp-1]:flex-none [&_.line-clamp-1]:overflow-visible!',
          )}
          onPointerDown={stopBoardPointer}
        >
          <span className="text-text-primary text-sm leading-none tabular-nums">
            {fontSize ?? '—'}
          </span>
        </SelectTrigger>
        <SelectContent
          className={cn(boardMenuSurfaceClass, 'z-[60] max-h-60')}
          onPointerDown={stopBoardPointer}
        >
          {fontSizeOptions(fontSize).map((size) => (
            <SelectItem key={size} value={String(size)} className="text-sm tabular-nums">
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="bg-border-default mx-0.5 h-6 w-px shrink-0" />
    </>
  );
};
