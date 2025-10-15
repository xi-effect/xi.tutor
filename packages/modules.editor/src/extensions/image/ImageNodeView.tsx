/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeViewWrapper } from '@tiptap/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { ArrowBottom, ArrowUp, Copy, Download, MoreVert, Trash, Upload } from '@xipkg/icons';
import clsx from 'clsx';
import { useBlockMenuActions, useYjsContext } from '../../hooks';

type ImageNodeViewPropsT = {
  node: any;
  updateAttributes: (attrs: Record<string, any>) => void;
  deleteNode: () => void;
};

export const ImageNodeView = ({ node }: ImageNodeViewPropsT) => {
  const src = node.attrs.src;
  const { editor } = useYjsContext();

  const { duplicate, remove, downloadImage, moveDown, moveUp } = useBlockMenuActions(editor);

  return (
    <NodeViewWrapper className="group relative max-w-[400px]">
      <img src={src} alt={node.attrs.alt || ''} className={clsx('h-auto rounded-lg')} />
      <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100">
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
              onSelect={() => console.log(1)}
            >
              <Upload size="sm" />
              <span className="text-sm">Заменить</span>
            </DropdownMenuItem>
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
