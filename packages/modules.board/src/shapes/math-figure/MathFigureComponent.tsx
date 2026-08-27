import { useMemo } from 'react';
import { HTMLContainer, SVGContainer, useEditor, useValue } from '@ibodr/draw';
import type { MathFigureShape } from './MathFigureShape';
import { buildMathFigureSvgProps } from './utils/buildMathFigureSvgProps';
import { MathFigureSvgContent } from './MathFigureSvgContent';

type MathFigureComponentProps = {
  shape: MathFigureShape;
};

export const MathFigureComponent = ({ shape }: MathFigureComponentProps) => {
  const editor = useEditor();
  const theme = useValue('theme', () => editor.getCurrentTheme(), [editor]);
  const colorMode = useValue('colorMode', () => editor.getColorMode(), [editor]);
  const {
    w,
    h,
    kind,
    showHiddenEdges,
    showLabels,
    showHeight,
    showMedian,
    showBisector,
    color,
    size,
  } = shape.props;
  const rw = Math.round(w);
  const rh = Math.round(h);

  const svgProps = useMemo(
    () => buildMathFigureSvgProps(shape, editor),
    // theme/colorMode affect getColorValue inside the builder
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      rw,
      rh,
      kind,
      showHiddenEdges,
      showLabels,
      showHeight,
      showMedian,
      showBisector,
      color,
      size,
      theme,
      colorMode,
      editor,
    ],
  );

  return (
    <HTMLContainer
      style={{
        width: w,
        height: h,
        pointerEvents: 'none',
        position: 'relative',
      }}
    >
      <SVGContainer viewBox={`0 0 ${rw} ${rh}`} preserveAspectRatio="none">
        <MathFigureSvgContent {...svgProps} />
      </SVGContainer>
    </HTMLContainer>
  );
};
