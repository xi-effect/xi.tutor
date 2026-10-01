import { DefaultDashStyle, type Editor } from '@ibodr/draw';

export const LINE_STYLES = ['solid', 'dashed', 'dotted', 'sparse', 'double'] as const;

export type LineStyleId = (typeof LINE_STYLES)[number];

type DashValue = (typeof DefaultDashStyle)['values'][number];

const dashValues = DefaultDashStyle.values as readonly string[];

/** Редкий пунктир и двойная линия есть только в сборке ibodr, где они добавлены в dash-стиль. */
export const hasExtendedLineStyles = dashValues.includes('sparse') && dashValues.includes('double');

export const availableLineStyles = LINE_STYLES.filter(
  (style) => (style !== 'sparse' && style !== 'double') || hasExtendedLineStyles,
);

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

export function applyArrowLineStyle(editor: Editor, style: LineStyleId) {
  editor.run(() => {
    editor.setStyleForNextShapes(DefaultDashStyle, asDash(style));

    for (const shape of editor.getSelectedShapes()) {
      if (shape.type !== 'arrow') continue;
      const props = shape.props as ArrowHeads;
      if (style === 'double' && !isPlainArrowLine(props)) continue;

      editor.updateShape({
        id: shape.id,
        type: 'arrow',
        props: { dash: asDash(style) },
      });
    }
  });
}
