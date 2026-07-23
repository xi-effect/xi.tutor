import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { ArrowBottom, ArrowUp, Copy, Download, MoreVert, Trash } from '@xipkg/icons';
import { useBlockMenuActions, useProtectedImage, useYjsContext } from '../../hooks';
import { cn } from '@xipkg/utils';
import { useCallback } from 'react';
import { ActiveBlockT } from '../../types';
import { NodeSelection } from '@tiptap/pm/state';

export const ImageNodeView = ({ node, getPos }: NodeViewProps) => {
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
  const { duplicate, remove, downloadImage, moveDown, moveUp } = useBlockMenuActions(
    editor,
    getActiveBlock,
  );

  const selected =
    editor?.state.selection instanceof NodeSelection && editor.state.selection.from === getPos();

  const imageSrc = useProtectedImage(src, storageToken);

  return (
    <NodeViewWrapper className="group relative flex justify-center" contentEditable={false}>
      <img
        src={imageSrc}
        alt={node.attrs.alt || ''}
        className={cn(
          'max-h-[600px] rounded-lg object-contain',
          selected && 'outline-border-focus outline-2 outline-offset-1',
        )}
        draggable={false}
      />
      <div
        className={cn(
          'absolute top-2 right-2 flex opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100',
        )}
      >
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="s" variant="none" className="rounded-lg px-2">
              <MoreVert size="sm" className="size-6" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            align="end"
            className="flex w-[200px] flex-col space-y-1 p-2"
          >
            <DropdownMenuItem
              className="hover:bg-background-page h-7 gap-2 rounded p-1"
              onSelect={() => downloadImage(imageSrc)}
            >
              <Download size="sm" className="size-6" />
              <span className="text-sm">Скачать</span>
            </DropdownMenuItem>

            {/* Остальные действия доступны только если редактор не в readonly режиме */}
            {!isReadOnly && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="hover:bg-background-page h-7 gap-2 rounded p-1"
                  onSelect={(e) => {
                    e.preventDefault();
                    moveUp();
                  }}
                >
                  <ArrowUp size="sm" className="size-6" />
                  <span className="text-sm">Выше</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="hover:bg-background-page h-7 gap-2 rounded p-1"
                  onSelect={(e) => {
                    e.preventDefault();
                    moveDown();
                  }}
                >
                  <ArrowBottom size="sm" className="size-6" />
                  <span className="text-sm">Ниже</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="hover:bg-background-page h-7 gap-2 rounded p-1"
                  onSelect={duplicate}
                >
                  <Copy size="sm" className="size-6" />
                  <span className="text-sm">Дублировать</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="hover:bg-background-page h-7 gap-2 rounded p-1"
                  onSelect={remove}
                >
                  <Trash size="sm" className="size-6" />
                  <span className="text-sm">Удалить</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </NodeViewWrapper>
  );
};
