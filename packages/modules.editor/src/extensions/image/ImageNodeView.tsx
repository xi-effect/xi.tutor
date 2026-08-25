import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import {
  useBlockMenuActions,
  useDrawingToggle,
  useDrawingTool,
  useProtectedImage,
  useYjsContext,
} from '../../hooks';
import { cn } from '@xipkg/utils';
import { useCallback } from 'react';
import { ActiveBlockT, StrokeT } from '../../types';
import { NodeSelection } from '@tiptap/pm/state';
import { DrawingToolbar } from '../../ui/components/drawing/DrawingToolbar';
import { DrawingOverlay } from '../../ui/components/drawing/DrawingOverlay';
import { MediaBlockMenu } from '../media/MediaBlockMenu';
import { DrawMenuItem } from '../../ui/components/drawing/DrawMenuItem';

export const ImageNodeView = ({ node, getPos, updateAttributes }: NodeViewProps) => {
  const src = node.attrs.src;
  const { isDrawing, close, toggle } = useDrawingToggle();

  const { editor, storageToken, isReadOnly } = useYjsContext();

  const getActiveBlock = useCallback((): ActiveBlockT | undefined => {
    if (typeof getPos !== 'function' || !editor) return;
    try {
      const pos = getPos();
      if (pos == null || pos < 0) return;
      // Верифицируем что нода на этой позиции — действительно image
      const { doc } = editor.state;
      if (pos >= doc.content.size) return;
      const $pos = doc.resolve(pos);
      const nodeAtPos = $pos.nodeAfter;

      if (nodeAtPos?.type.name === 'image' && nodeAtPos.attrs.src === src) {
        return { editor, node: nodeAtPos, pos };
      }

      let found: ActiveBlockT | undefined;
      doc.descendants((n, p) => {
        if (found) return false;
        if (n.type.name === 'image' && n.attrs.src === src) {
          found = { editor, node: n, pos: p };
          return false;
        }
        return true;
      });
      return found;
    } catch {
      return;
    }
  }, [editor, getPos, src]);
  const { downloadImage } = useBlockMenuActions(editor, getActiveBlock);

  const selected =
    editor?.state.selection instanceof NodeSelection && editor.state.selection.from === getPos();

  const imageSrc = useProtectedImage(src, storageToken);

  const annotations: StrokeT[] = node.attrs.annotations ?? [];

  const handleChangeStrokes = useCallback(
    (next: StrokeT[]) => updateAttributes({ annotations: next }),
    [updateAttributes],
  );

  const { tool, canUndo, clear, undo, setTool } = useDrawingTool(annotations, handleChangeStrokes);

  return (
    <NodeViewWrapper className="group relative flex justify-center" contentEditable={false}>
      <div className="relative inline-block">
        <img
          src={imageSrc}
          alt={node.attrs.alt || ''}
          className={cn(
            'max-h-[600px] rounded-lg object-contain',
            selected && 'outline-border-focus outline-2 outline-offset-1',
          )}
          draggable={false}
        />

        <DrawingOverlay
          className="absolute inset-0"
          strokes={annotations}
          onChangeStrokes={handleChangeStrokes}
          tool={tool}
          isActive={isDrawing && !isReadOnly}
        />

        {isDrawing && (
          <DrawingToolbar
            tool={tool}
            onToolChange={setTool}
            onUndo={undo}
            onClear={clear}
            onClose={close}
            canUndo={canUndo}
          />
        )}
      </div>

      <div
        className={cn(
          'absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity',
          'group-hover:pointer-events-auto group-hover:opacity-100',
          isDrawing && 'pointer-events-auto opacity-100',
        )}
      >
        <MediaBlockMenu
          editor={editor}
          getActiveBlock={getActiveBlock}
          isReadOnly={isReadOnly}
          onDownload={() => downloadImage(imageSrc)}
          extraItems={<DrawMenuItem onSelect={toggle} />}
        />
      </div>
    </NodeViewWrapper>
  );
};
