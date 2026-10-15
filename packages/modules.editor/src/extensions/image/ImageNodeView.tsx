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
import { DrawingToolbar, DrawingOverlay, DrawSwitchButton } from '../../ui/components/drawing';
import { MediaBlockMenu } from '../media/MediaBlockMenu';

export const ImageNodeView = ({ node, getPos, updateAttributes, selected }: NodeViewProps) => {
  const src = node.attrs.src;
  const { editor, storageToken, isReadOnly } = useYjsContext();
  const { isDrawing, toggle, close } = useDrawingToggle(editor, getPos);

  const getActiveBlock = useNodeActiveBlock(editor, getPos, 'image');
  const { downloadImage } = useBlockMenuActions(editor, getActiveBlock);

  const computedSelection =
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
    <NodeViewWrapper className="flex justify-center" contentEditable={false}>
      <div className="group relative min-w-0">
        <img
          src={imageSrc}
          alt={node.attrs.alt || ''}
          className={cn(
            'block max-h-[600px] max-w-full rounded-lg object-contain',
            (selected || computedSelection) && 'outline-border-focus outline-2 outline-offset-1',
          )}
          draggable={false}
        />

        <DrawingOverlay
          className="absolute inset-0"
          {...overlayProps}
          isActive={isDrawing && !isReadOnly}
        />

        {isDrawing && <DrawingToolbar {...toolbarProps} onClose={close} />}

        <div
          data-editor-ignore
          className={cn(
            'absolute top-1 right-1 bottom-1 flex flex-col-reverse flex-wrap-reverse content-start justify-end gap-1',
            'opacity-100 transition-opacity group-hover:opacity-100 pointer-fine:opacity-0',
            isDrawing && 'pointer-events-none opacity-0 group-hover:opacity-0',
          )}
        >
          <DrawSwitchButton onClick={toggle} />
          <MediaBlockMenu
            editor={editor}
            getActiveBlock={getActiveBlock}
            isReadOnly={isReadOnly}
            onDownload={() => downloadImage(imageSrc)}
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
};
