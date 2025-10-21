/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useBlockMenuActions, useYjsContext } from '../../hooks';
import { cn } from '@xipkg/utils';

export const ImageNodeView = ({ node, selected }: NodeViewProps) => {
  const src = node.attrs.src;
  const { editor } = useYjsContext();
  const { duplicate, remove, downloadImage, moveDown, moveUp } = useBlockMenuActions(editor);

  return (
    <NodeViewWrapper className="group relative flex justify-center">
      <img
        src={src}
        alt={node.attrs.alt || ''}
        className={cn(
          'max-h-[600px] rounded-lg object-contain',
          selected && 'outline-brand-80 outline-2 outline-offset-1',
        )}
      />

      <div
        className={cn(
          'absolute top-2 right-2 flex transition-opacity',
          selected ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="s" variant="ghost" className="rounded-lg px-2">
              <MoreVert size="sm" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            align="end"
            className="flex w-[200px] flex-col space-y-1 p-2"
          >
            <DropdownMenuItem
              className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
              onSelect={() => downloadImage(src)}
            >
              <Download size="sm" />
              <span className="text-sm">Скачать</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="hover:bg-gray-5 h-7 gap-2 rounded p-1" onSelect={moveUp}>
              <ArrowUp size="sm" />
              <span className="text-sm">Выше</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="hover:bg-gray-5 h-7 gap-2 rounded p-1" onSelect={moveDown}>
              <ArrowBottom size="sm" />
              <span className="text-sm">Ниже</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
              onSelect={duplicate}
            >
              <Copy size="sm" />
              <span className="text-sm">Дублировать</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="hover:bg-gray-5 h-7 gap-2 rounded p-1" onClick={remove}>
              <Trash size="sm" />
              <span className="text-sm">Удалить</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </NodeViewWrapper>
  );
};
