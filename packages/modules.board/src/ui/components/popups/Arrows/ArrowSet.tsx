import {
  useEditor,
  useValue,
  ArrowShapeArrowheadStartStyle,
  ArrowShapeArrowheadEndStyle,
  DefaultDashStyle,
} from '@ibodr/draw';
import { Arrow, ArrowDouble } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import {
  DashDotLineIcon,
  DashedLineIcon,
  DottedLineIcon,
  DoubleLineIcon,
  SolidLineIcon,
  SparseLineIcon,
  WavyLineIcon,
} from './lineStyleIcons';
import {
  applyArrowHeads,
  applyArrowLineStyle,
  availableLineStyles,
  type LineStyleId,
} from './lineStyle';

const LINE_ICONS: Record<LineStyleId, () => React.ReactNode> = {
  solid: SolidLineIcon,
  dashed: DashedLineIcon,
  dotted: DottedLineIcon,
  sparse: SparseLineIcon,
  'dash-dot': DashDotLineIcon,
  wavy: WavyLineIcon,
  double: DoubleLineIcon,
};

const optionClass = (active: boolean) =>
  cn(
    'flex size-8 shrink-0 appearance-none items-center justify-center rounded-lg border bg-transparent p-0',
    active ? 'border-border-focus' : 'border-transparent',
  );

export const ArrowSet = ({ className }: { className?: string }) => {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const start = useValue(
    'arrow-head-start',
    () => editor.getStyleForNextShape(ArrowShapeArrowheadStartStyle),
    [editor],
  );
  const end = useValue(
    'arrow-head-end',
    () => editor.getStyleForNextShape(ArrowShapeArrowheadEndStyle),
    [editor],
  );
  const dash = useValue('arrow-dash', () => editor.getStyleForNextShape(DefaultDashStyle), [
    editor,
  ]);

  const isPlainLine = start === 'none' && end === 'none';
  const lineStyles = availableLineStyles;

  return (
    <div
      className={cn(
        'border-border-default bg-background-surface flex w-max max-w-full flex-wrap items-center gap-1 rounded-xl border p-1 shadow-none',
        className,
      )}
    >
      <button
        type="button"
        className={optionClass(start === 'none' && end === 'arrow')}
        title={t('lineStyle.arrowSingle')}
        onClick={() => applyArrowHeads(editor, 'none', 'arrow', { applyToSelection: false })}
      >
        <Arrow />
      </button>
      <button
        type="button"
        className={optionClass(start === 'arrow' && end === 'arrow')}
        title={t('lineStyle.arrowDouble')}
        onClick={() => applyArrowHeads(editor, 'arrow', 'arrow', { applyToSelection: false })}
      >
        <ArrowDouble />
      </button>

      <span className="w-2 shrink-0" aria-hidden />

      {lineStyles.map((style) => {
        const Icon = LINE_ICONS[style];
        return (
          <button
            key={style}
            type="button"
            className={cn(optionClass(isPlainLine && String(dash) === style), 'text-icon-primary')}
            title={t(`lineStyle.${style}`)}
            onClick={() => {
              editor.setCurrentTool('arrow');
              applyArrowLineStyle(editor, style, { asLine: true, applyToSelection: false });
            }}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
};
