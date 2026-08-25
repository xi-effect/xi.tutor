import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { DropdownMenuItem } from '@xipkg/dropdown';

import { Edit } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { useBlockMenuActions, useProtectedImage, useYjsContext } from '../../hooks';
import { cn } from '@xipkg/utils';
import { useCallback, useState } from 'react';
import { ActiveBlockT, DrawToolT, StrokeT } from '../../types';
import { NodeSelection } from '@tiptap/pm/state';
import { DrawingToolbar } from '../../ui/components/drawing/DrawingToolbar';
import { DrawingOverlay } from '../../ui/components/drawing/DrawingOverlay';
import { MediaBlockMenu } from '../media/MediaBlockMenu';

export const ImageNodeView = ({ node, getPos, updateAttributes }: NodeViewProps) => {
  const { t } = useTranslation('editor');
  const src = node.attrs.src;

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

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<DrawToolT>({ mode: 'draw', color: '#1A1A1A', size: 0.006 });

  const annotations: StrokeT[] = node.attrs.annotations ?? [];

  const handleChangeStrokes = useCallback(
    (next: StrokeT[]) => updateAttributes({ annotations: next }),
    [updateAttributes],
  );

  const EditButton = (
    <DropdownMenuItem
      className={cn('hover:bg-background-page h-7 gap-2 rounded p-1')}
      onClick={() => setIsDrawing((state) => !state)}
    >
      <Edit size="sm" className="size-6" />
      {t('media.draw')}
    </DropdownMenuItem>
  );

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
            onUndo={() => handleChangeStrokes(annotations.slice(0, -1))}
            onClear={() => handleChangeStrokes([])}
            onClose={() => setIsDrawing(false)}
            canUndo={annotations.length > 0}
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
          extraItems={EditButton}
        />
      </div>
    </NodeViewWrapper>
  );
};
