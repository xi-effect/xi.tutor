import React, { useEffect, useMemo } from 'react';
import { Layer, Shape } from 'react-konva';
import { useUIStore } from '../../store';
import { gridConfig } from '../../utils';

const BackgroundLayerComponent = () => {
  const { viewport, setViewport, stagePosition, scale } = useUIStore();

  useEffect(() => {
    const updateSize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [setViewport]);

  const dots = useMemo(() => {
    if (!viewport) return null;

    const { baseGridStep, baseDotSize, minDotSize } = gridConfig;

    const visibleWidth = viewport.width / scale;
    const visibleHeight = viewport.height / scale;

    const stepMultiplier = 2 ** Math.round(Math.log2(1 / scale));

    let gridStep = baseGridStep * stepMultiplier;

    let dotSize = Math.max(baseDotSize * stepMultiplier ** 1, minDotSize);

    if (scale < 0.01) {
      gridStep /= 2;
      dotSize /= 2;
    }

    const buffer = Math.max(visibleWidth, visibleHeight) * 2;

    const startX = Math.floor((-stagePosition.x / scale - buffer) / gridStep) * gridStep;
    const endX =
      Math.ceil((-stagePosition.x / scale + visibleWidth + buffer) / gridStep) * gridStep;
    const startY = Math.floor((-stagePosition.y / scale - buffer) / gridStep) * gridStep;
    const endY =
      Math.ceil((-stagePosition.y / scale + visibleHeight + buffer) / gridStep) * gridStep;

    return (
      <Shape
        sceneFunc={(context) => {
          context.fillStyle = gridConfig.dotFill;
          for (let x = startX; x <= endX; x += gridStep) {
            for (let y = startY; y <= endY; y += gridStep) {
              context.beginPath();
              context.arc(x, y, dotSize, 0, Math.PI * 2);
              context.fill();
            }
          }
        }}
      />
    );
  }, [viewport, scale, stagePosition.x, stagePosition.y]);

  return <Layer listening={false}>{dots}</Layer>;
};

export const BackgroundLayer = React.memo(BackgroundLayerComponent);
