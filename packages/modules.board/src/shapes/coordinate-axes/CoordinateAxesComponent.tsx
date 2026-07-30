import { useMemo } from 'react';
import { HTMLContainer, SVGContainer, useEditor, useValue } from '@ibodr/draw';
import type { CoordinateAxesShape } from './CoordinateAxesShape';
import { buildCoordinateAxesSvgProps, CoordinateAxesSvgContent } from './CoordinateAxesSvgContent';

type CoordinateAxesComponentProps = {
  shape: CoordinateAxesShape;
};

export const CoordinateAxesComponent = ({ shape }: CoordinateAxesComponentProps) => {
  const editor = useEditor();
  const theme = useValue('theme', () => editor.getCurrentTheme(), [editor]);
  const colorMode = useValue('colorMode', () => editor.getColorMode(), [editor]);

  const {
    w,
    h,
    xMin,
    xMax,
    yMin,
    yMax,
    xDivisions,
    yDivisions,
    showLabels,
    equation,
    color,
    plotColor,
  } = shape.props;

  const rw = Math.round(w);
  const rh = Math.round(h);

  const svgProps = useMemo(
    () => buildCoordinateAxesSvgProps(shape, editor),
    // theme/colorMode affect getColorValue inside the builder
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      rw,
      rh,
      xMin,
      xMax,
      yMin,
      yMax,
      xDivisions,
      yDivisions,
      showLabels,
      equation,
      color,
      plotColor,
      theme,
      colorMode,
      editor,
      shape,
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
      <SVGContainer>
        <CoordinateAxesSvgContent {...svgProps} />
      </SVGContainer>
    </HTMLContainer>
  );
};
