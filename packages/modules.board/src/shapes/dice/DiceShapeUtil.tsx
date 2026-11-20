import {
  BaseBoxShapeUtil,
  HTMLContainer,
  Rectangle2d,
  resizeBox,
  type DrResizeInfo,
} from '@ibodr/draw';
import { normalizeDiceFace, rerollDiceFace } from '../../dice/diceRoll';
import { resolveBoardCssColor, resolveLodStyle } from '../../utils/resolveLodStyle';
import { DICE_MIN_SIZE, DICE_SHAPE_SIZE, diceShapeProps, type DiceShape } from './diceShape';
import { DiceShapeView } from './DiceShapeView';

export class DiceShapeUtil extends BaseBoxShapeUtil<DiceShape> {
  static override type = 'dice' as const;
  static override props = diceShapeProps;

  override getDefaultProps(): DiceShape['props'] {
    return {
      w: DICE_SHAPE_SIZE,
      h: DICE_SHAPE_SIZE,
      sides: 6,
      value: 1,
      rolledAt: 0,
    };
  }

  override getLodStyle(shape: DiceShape) {
    const face = normalizeDiceFace(shape.props.sides, shape.props.value);
    const edge = Math.min(shape.props.w, shape.props.h);

    return resolveLodStyle({
      fill: 'var(--xi-background-surface)',
      stroke: 'var(--xi-border-default)',
      strokeWidth: 1,
      label: String(face.value),
      labelSize: edge * 0.46,
      labelColor: 'var(--xi-text-primary)',
    });
  }

  override canEdit() {
    return false;
  }

  /** Двойной клик и двойной тап перебрасывают кубик. Число записывается в фигуру, поэтому оно общее. */
  override onDoubleClick(shape: DiceShape) {
    return {
      id: shape.id,
      type: shape.type,
      props: rerollDiceFace(shape.props.sides),
    };
  }

  override canResize() {
    return true;
  }

  override isAspectRatioLocked() {
    return true;
  }

  override onResize(shape: DiceShape, info: DrResizeInfo<DiceShape>) {
    return resizeBox(shape, info, {
      minWidth: DICE_MIN_SIZE,
      minHeight: DICE_MIN_SIZE,
    });
  }

  override getGeometry(shape: DiceShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override component(shape: DiceShape) {
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          pointerEvents: 'all',
        }}
      >
        <DiceShapeView shape={shape} />
      </HTMLContainer>
    );
  }

  override toSvg(shape: DiceShape) {
    const face = normalizeDiceFace(shape.props.sides, shape.props.value);
    const { w, h } = shape.props;
    const fill = resolveBoardCssColor('var(--xi-background-surface)');
    const ink = resolveBoardCssColor('var(--xi-text-primary)');
    const stroke = resolveBoardCssColor('var(--xi-border-default)');

    return (
      <svg width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        <rect
          x="1"
          y="1"
          width={Math.max(0, w - 2)}
          height={Math.max(0, h - 2)}
          rx={Math.min(w, h) * 0.14}
          fill={fill}
          stroke={stroke}
        />
        <text
          x={w / 2}
          y={h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={ink}
          fontSize={Math.min(w, h) * 0.42}
          fontFamily="sans-serif"
          fontWeight={600}
        >
          {face.value}
        </text>
      </svg>
    );
  }

  override getIndicatorPath(shape: DiceShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
