import { memo, useEffect } from 'react';
import { Layer, Transformer } from 'react-konva';
import { LineShape } from './Shapes';
import { useStage } from '../../providers';
import { useBoardStore } from '../../store';
import { useElementHandlers, useIsStageScaling } from '../../hooks';
import { EditableText } from '../../features';

export const CanvasLayer = memo(() => {
  const { boardElements, selectedElementId, updateElement } = useBoardStore();

  const { layerRef, transformerRef } = useStage();
  const { handleTransformEnd, handleDragStart, onChangeTransformerPosition } = useElementHandlers();
  const { isScaling } = useIsStageScaling();

  useEffect(() => {
    if (transformerRef.current && selectedElementId) {
      const selectedNode = layerRef.current?.findOne(`#${selectedElementId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
        const box = transformerRef.current.getClientRect();
        updateElement('toolbar', { x: box.x, y: box.y });
      } else {
        transformerRef.current.nodes([]);
      }
    } else {
      transformerRef.current?.nodes([]);
    }
  }, [layerRef, selectedElementId, transformerRef, updateElement]);

  useEffect(() => {
    if (!isScaling && selectedElementId) {
      onChangeTransformerPosition();
    }
  }, [isScaling, onChangeTransformerPosition, selectedElementId]);

  return (
    <Layer ref={layerRef}>
      {boardElements.map((element) => {
        if (element.type === 'line') {
          return <LineShape key={element.id} element={element} />;
        }
        if (element.type === 'text') {
          return <EditableText key={element.id} element={element} />;
        }
      })}
      {selectedElementId && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          flipEnabled={false}
          anchorCornerRadius={8}
          anchorStroke="#070707"
          borderStroke="#070707"
          borderDash={[5, 5]}
          padding={8}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          onTransformEnd={handleTransformEnd}
          onDragStart={handleDragStart}
          onTransformStart={handleDragStart}
        />
      )}
    </Layer>
  );
});

CanvasLayer.displayName = 'CanvasLayer';
