import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import {
  useBlockMenuActions,
  useDrawingToggle,
  useDrawingLayer,
  useNodeAttribute,
  useProtectedImage,
  useYjsContext,
  useNodeActiveBlock,
} from '../../hooks';
import { cn } from '@xipkg/utils';
import { StrokeT } from '../../types';
import { NodeSelection } from '@tiptap/pm/state';
import { DrawingToolbar } from '../../ui/components/drawing/DrawingToolbar';
import { DrawingOverlay } from '../../ui/components/drawing/DrawingOverlay';
import { MediaBlockMenu } from '../media/MediaBlockMenu';
import { DrawMenuItem } from '../../ui/components/drawing/DrawMenuItem';

export const ImageNodeView = ({ node, getPos, updateAttributes }: NodeViewProps) => {
  const src = node.attrs.src;
  const { editor, storageToken, isReadOnly } = useYjsContext();
  const { isDrawing, toggle, close } = useDrawingToggle();

  const getActiveBlock = useNodeActiveBlock(editor, getPos, 'image');
  const { downloadImage } = useBlockMenuActions(editor, getActiveBlock);

  const selected =
    editor?.state.selection instanceof NodeSelection && editor.state.selection.from === getPos();

  const imageSrc = useProtectedImage(src, storageToken);

  const [annotations, setAnnotations] = useNodeAttribute<StrokeT[]>(
    updateAttributes,
    'annotations',
    node.attrs.annotations,
    [],
  );

  const { overlayProps, toolbarProps } = useDrawingLayer(annotations, setAnnotations);

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
          {...overlayProps}
          isActive={isDrawing && !isReadOnly}
        />

        {isDrawing && <DrawingToolbar {...toolbarProps} onClose={close} />}
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
