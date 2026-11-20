import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Slider } from '@xipkg/slider';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { ColorDot } from '../../ui/components/canvas';
import { boardTextToolbarClass } from '../../ui/boardTheme';
import { BOARD_COLORS, getBoardColorOption } from '../../utils/boardColors';
import { useTextHighlightStore } from '../../store/useTextHighlightStore';
import {
  DEFAULT_TEXT_HIGHLIGHT_PRESETS,
  highlightStyleKey,
  normalizeHighlightStyle,
  stylesEqual,
  type TextHighlightStyle,
} from './highlightStyle';

const activeStoredStyle = () => {
  const { presets, activePresetIndex } = useTextHighlightStore.getState();
  return presets[activePresetIndex] ?? DEFAULT_TEXT_HIGHLIGHT_PRESETS[0];
};

const presetDotSize = (opacity: number) => 12 + (opacity / 100) * 12;

type HighlightStyleMenuProps = {
  /** Стиль текущего текста. null — в выделении нет заливки, показываем активный пресет. */
  value: TextHighlightStyle | null;
  /** Меняется, когда пользователь выбирает другой текст. Ползунок при этом не сбрасывается. */
  sourceId: string;
  onChange: (style: TextHighlightStyle) => void;
};

const keepTextSelection = (event: React.MouseEvent) => {
  event.preventDefault();
};

export const HighlightStyleMenu = ({ value, sourceId, onChange }: HighlightStyleMenuProps) => {
  const { t } = useTranslation('board');
  const { presets, activePresetIndex, setActivePreset, setHighlightStyle } =
    useTextHighlightStore();
  const stored = presets[activePresetIndex] ?? DEFAULT_TEXT_HIGHLIGHT_PRESETS[0];
  const [draft, setDraft] = useState<TextHighlightStyle>(value ?? stored);
  const valueRef = useRef(value);
  const draftRef = useRef(draft);
  const draftIsLocal = useRef(false);
  valueRef.current = value;
  draftRef.current = draft;
  const valueKey = value ? highlightStyleKey(value) : '';

  useEffect(() => {
    draftIsLocal.current = false;
    setDraft(valueRef.current ?? activeStoredStyle());
  }, [sourceId]);

  useEffect(() => {
    const current = valueRef.current;
    if (draftIsLocal.current) {
      if (!current || stylesEqual(current, draftRef.current)) draftIsLocal.current = false;
      return;
    }
    setDraft(current ?? activeStoredStyle());
  }, [valueKey]);

  const commit = (style: TextHighlightStyle) => {
    const next = normalizeHighlightStyle(style.color, style.opacity);
    draftIsLocal.current = true;
    draftRef.current = next;
    setDraft(next);
    setHighlightStyle(next);
    onChange(next);
  };

  return (
    <div
      data-text-highlight-menu=""
      data-board-control=""
      className="border-border-default bg-background-surface pointer-events-auto flex w-max max-w-[calc(100vw-1.5rem)] flex-col items-center gap-3 rounded-xl border p-3 shadow-md sm:flex-row"
      onMouseDown={keepTextSelection}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex shrink-0 items-center gap-1.5">
        {presets.map((preset, index) => {
          const colorOption = getBoardColorOption(preset.color);
          const dotSize = presetDotSize(preset.opacity);
          const isActive = stylesEqual(preset, draft);

          return (
            <button
              key={highlightStyleKey(preset) + index}
              type="button"
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all',
                isActive
                  ? 'ring-border-focus ring-2 ring-offset-1'
                  : 'hover:ring-border-control hover:ring-1',
              )}
              aria-label={t('textFormat.highlightPreset', { index: index + 1 })}
              aria-pressed={isActive}
              onClick={() => {
                setActivePreset(index);
                const next = presets[index];
                if (!next) return;
                setDraft(next);
                onChange(next);
              }}
            >
              <span
                className={cn('block rounded-full', !colorOption?.cssVar && 'bg-gray-100')}
                style={{
                  width: dotSize,
                  height: dotSize,
                  opacity: preset.opacity / 100,
                  backgroundColor: colorOption?.cssVar,
                }}
              />
            </button>
          );
        })}
      </div>

      <div className="bg-border-default hidden h-8 w-px shrink-0 sm:block" />

      <div className="flex items-center gap-2" aria-label={t('textFormat.highlightOpacity')}>
        <div className="w-20 shrink-0 sm:w-24">
          <Slider
            value={[draft.opacity]}
            min={10}
            max={100}
            step={10}
            onValueChange={(next) =>
              commit({ color: draft.color, opacity: next[0] ?? draft.opacity })
            }
          />
        </div>
        <span className="text-text-primary w-7 shrink-0 text-right text-xs tabular-nums">
          {draft.opacity}
        </span>
      </div>

      <div className="bg-border-default hidden h-8 w-px shrink-0 sm:block" />

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {BOARD_COLORS.map(({ name, class: colorClass, cssVar }) => (
          <ColorDot
            key={name}
            colorClass={colorClass}
            colorCss={cssVar}
            isSelected={draft.color === name}
            onClick={() => commit({ color: name, opacity: draft.opacity })}
          />
        ))}
      </div>
    </div>
  );
};

type TextFormattingBarProps = {
  highlightValue: TextHighlightStyle | null;
  highlightSourceId: string;
  highlightMenuOpen: boolean;
  onHighlightMenuClose: () => void;
  onHighlightChange: (style: TextHighlightStyle) => void;
  children: ReactNode;
};

/** Панель форматирования. Цвет выделения открывается кнопкой кисти. */
export const TextFormattingBar = ({
  highlightValue,
  highlightSourceId,
  highlightMenuOpen,
  onHighlightMenuClose,
  onHighlightChange,
  children,
}: TextFormattingBarProps) => {
  useEffect(() => {
    if (!highlightMenuOpen) return;

    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-text-highlight-menu], [data-text-highlight-trigger]')) return;
      onHighlightMenuClose();
    };

    document.addEventListener('pointerdown', closeOnOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointerDown);
  }, [highlightMenuOpen, onHighlightMenuClose]);

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-2">
      {highlightMenuOpen && (
        <HighlightStyleMenu
          value={highlightValue}
          sourceId={highlightSourceId}
          onChange={onHighlightChange}
        />
      )}
      <div className={cn(boardTextToolbarClass, 'items-center')}>{children}</div>
    </div>
  );
};
