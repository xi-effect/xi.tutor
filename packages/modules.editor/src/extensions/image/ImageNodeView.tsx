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
import { useMemo, useState } from 'react';
import { ActiveBlockT } from '../../types';

export const ImageNodeView = ({ node, selected, getPos }: NodeViewProps) => {
  const [hovered, setHovered] = useState(false);
  const src = node.attrs.src;

  const { editor, storageToken, isReadOnly } = useYjsContext();

  const currentBlock = useMemo<ActiveBlockT | undefined>(() => {
    if (typeof getPos !== 'function' || !editor) {
      return;
    }

    try {
      const currentPosition = getPos();
      if (currentPosition == null) return;
      return {
        editor,
        node,
        pos: currentPosition,
      };
    } catch {
      return;
    }
  }, [editor, getPos, node]);

  const { duplicate, remove, downloadImage, moveDown, moveUp } = useBlockMenuActions(
    editor,
    currentBlock,
  );

  const imageSrc = useProtectedImage(src, storageToken);

  return (
    <NodeViewWrapper
      className="group relative flex justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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
          hovered ? 'pointer-events-auto opacity-100' : 'opacity-0',
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
                  onSelect={moveUp}
                >
                  <ArrowUp size="sm" className="size-6" />
                  <span className="text-sm">Выше</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                  onSelect={moveDown}
                >
                  <ArrowBottom size="sm" className="size-6" />
                  <span className="text-sm">Ниже</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                  onSelect={duplicate}
                >
                  <Copy size="sm" className="size-6" />
                  <span className="text-sm">Дублировать</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
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
