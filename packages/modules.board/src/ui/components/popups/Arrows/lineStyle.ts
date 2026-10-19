import {
  ArrowShapeArrowheadEndStyle,
  ArrowShapeArrowheadStartStyle,
  DefaultDashStyle,
  type Editor,
} from '@ibodr/draw';
import { EXTRA_LINE_STYLES } from '../../../../shapes/lineStyles/extendedLineStyles';

export const LINE_STYLES = [
  'solid',
  'dashed',
  'dotted',
  'sparse',
  'dash-dot',
  'wavy',
  'double',
] as const;

export type LineStyleId = (typeof LINE_STYLES)[number];

type DashValue = (typeof DefaultDashStyle)['values'][number];

const dashValues = DefaultDashStyle.values as readonly string[];

if (EXTRA_LINE_STYLES.some((style) => !dashValues.includes(style))) {
  throw new Error('Extended line styles were not registered on DefaultDashStyle');
}

/** В меню только те стили, которые текущая сборка умеет сохранить в dash. */
export const availableLineStyles = LINE_STYLES.filter((style) => dashValues.includes(style));

function asDash(style: LineStyleId): DashValue {
  return style as unknown as DashValue;
}

export function isLineStyleId(value: string): value is LineStyleId {
  return (LINE_STYLES as readonly string[]).includes(value);
}

type ArrowHeads = {
  arrowheadStart: string;
  arrowheadEnd: string;
  dash: string;
};

export function isPlainArrowLine(props: ArrowHeads) {
  return props.arrowheadStart === 'none' && props.arrowheadEnd === 'none';
}

/** Волнистая — только линия, без наконечников. */
export function isWavyLineStyle(style: string) {
  return style === 'wavy';
}

type ArrowHead = 'none' | 'arrow';

type ApplyStyleOptions = {
  asLine?: boolean;
  /** Панель инструмента задаёт только следующую линию и снимает выделение. */
  applyToSelection?: boolean;
};

/** Стрелка в панели инструмента: наконечники и сплошная линия. */
export function applyArrowHeads(
  editor: Editor,
  start: ArrowHead,
  end: ArrowHead,
  options?: Pick<ApplyStyleOptions, 'applyToSelection'>,
) {
  const applyToSelection = options?.applyToSelection !== false;

  editor.run(() => {
    editor.setCurrentTool('arrow');
    editor.setStyleForNextShapes(ArrowShapeArrowheadStartStyle, start);
    editor.setStyleForNextShapes(ArrowShapeArrowheadEndStyle, end);
    editor.setStyleForNextShapes(DefaultDashStyle, asDash('solid'));

    if (!applyToSelection) {
      editor.selectNone();
      return;
    }

    for (const shape of editor.getSelectedShapes()) {
      if (shape.type !== 'arrow') continue;
      editor.updateShape({
        id: shape.id,
        type: 'arrow',
        props: {
          dash: asDash('solid'),
          arrowheadStart: start,
          arrowheadEnd: end,
        },
      });
    }
  });
}

export function applyArrowLineStyle(
  editor: Editor,
  style: LineStyleId,
  options?: ApplyStyleOptions,
) {
  const asLine = options?.asLine || isWavyLineStyle(style);
  const applyToSelection = options?.applyToSelection !== false;

  editor.run(() => {
    editor.setStyleForNextShapes(DefaultDashStyle, asDash(style));
    if (asLine) {
      editor.setStyleForNextShapes(ArrowShapeArrowheadStartStyle, 'none');
      editor.setStyleForNextShapes(ArrowShapeArrowheadEndStyle, 'none');
    }

    if (!applyToSelection) {
      editor.selectNone();
      return;
    }

    for (const shape of editor.getSelectedShapes()) {
      if (shape.type !== 'arrow') continue;
      const props = shape.props as ArrowHeads;
      if (isWavyLineStyle(style) && !options?.asLine && !isPlainArrowLine(props)) continue;
      if (style === 'double' && !asLine && !isPlainArrowLine(props)) continue;

      editor.updateShape({
        id: shape.id,
        type: 'arrow',
        props: asLine
          ? { dash: asDash(style), arrowheadStart: 'none', arrowheadEnd: 'none' }
          : { dash: asDash(style) },
      });
    }
  });
}
