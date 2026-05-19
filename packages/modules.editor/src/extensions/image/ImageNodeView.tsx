// /* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useMemo } from 'react';
import { ActiveBlockT } from '../../types';

export const ImageNodeView = ({ node, selected, getPos }: NodeViewProps) => {
  const src = node.attrs.src;

  const { editor, storageToken, isReadOnly } = useYjsContext();
  const { duplicate, remove, downloadImage, moveDown, moveUp } = useBlockMenuActions(editor);

  const imageSrc = useProtectedImage(src, storageToken);

  const currentBlock = useMemo<ActiveBlockT | null>(() => {
    if (typeof getPos !== 'function' || !editor) {
      return null;
    }
    let currentPosition;
    try {
      currentPosition = getPos();
    } catch {
      return null;
    }

    if (currentPosition == null) return null;
    return {
      editor,
      node,
      pos: currentPosition,
    };
  }, [editor, getPos, node]);

  const selectHandle = (handler: (activeBlock: ActiveBlockT) => unknown) => {
    if (!currentBlock) return;

    return handler(currentBlock);
  };

  return (
    <NodeViewWrapper className="group relative flex justify-center">
      <img
        src={imageSrc}
        alt={node.attrs.alt || ''}
        className={cn(
          'max-h-[600px] rounded-lg object-contain',
          selected && 'outline-brand-80 outline-2 outline-offset-1',
        )}
      />
      <div
        className={cn(
          'absolute top-2 right-2 flex transition-opacity',
          'pointer-events-auto opacity-100',
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
              className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
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
                  className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                  onSelect={() => selectHandle(moveUp)}
                >
                  <ArrowUp size="sm" className="size-6" />
                  <span className="text-sm">Выше</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                  onSelect={() => selectHandle(moveDown)}
                >
                  <ArrowBottom size="sm" className="size-6" />
                  <span className="text-sm">Ниже</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                  onSelect={() => selectHandle(duplicate)}
                >
                  <Copy size="sm" className="size-6" />
                  <span className="text-sm">Дублировать</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                  onSelect={() => selectHandle(remove)}
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
