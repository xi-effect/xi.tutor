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
import { useState, useEffect } from 'react';
import { getAxiosInstance } from 'common.config';

// Кеш blob URL для уже загруженных изображений (по исходному src)
const blobUrlCache = new Map<string, string>();

export const ImageNodeView = ({ node, selected }: NodeViewProps) => {
  const src = node.attrs.src;
  const { editor, storageToken, isReadOnly } = useYjsContext();
  const { duplicate, remove, downloadImage, moveDown, moveUp } = useBlockMenuActions(editor);
  const [imageSrc, setImageSrc] = useState<string>(src);

  useEffect(() => {
    const loadImageWithToken = async () => {
      // Если нет src или токена — используем исходный src
      if (!src || !storageToken) {
        setImageSrc(src);
        return;
      }

      // Пропускаем data: и blob: URL — они уже пригодны к отображению
      if (src.startsWith('data:') || src.startsWith('blob:')) {
        setImageSrc(src);
        return;
      }

      // Проверяем кеш
      const cached = blobUrlCache.get(src);
      if (cached) {
        setImageSrc(cached);
        return;
      }

      try {
        // Загружаем изображение с заголовком токена через axios
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst.get(src, {
          responseType: 'blob',
          headers: {
            'x-storage-token': storageToken,
          },
        });

        if (response.status !== 200) {
          setImageSrc(src);
          return;
        }

        // Создаем blob URL из загруженного изображения
        const blob = response.data;
        const blobUrl = URL.createObjectURL(blob);

        // Сохраняем в кеш
        blobUrlCache.set(src, blobUrl);

        setImageSrc(blobUrl);
      } catch (error) {
        console.error('[ImageNodeView] Ошибка при загрузке изображения:', error);
        // На любой ошибке используем исходный src
        setImageSrc(src);
      }
    };

    loadImageWithToken();
  }, [src, storageToken]);

  // Очистка blob URL при размонтировании компонента (если это последний компонент с этим src)
  useEffect(() => {
    return () => {
      // Не очищаем blob URL сразу, так как он может использоваться другими компонентами
      // Кеш управляется глобально, очистка будет выполнена при необходимости
    };
  }, []);

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

            {/* Остальные действия доступны только если редактор не в readonly режиме */}
            {!isReadOnly && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                  onSelect={moveUp}
                >
                  <ArrowUp size="sm" />
                  <span className="text-sm">Выше</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                  onSelect={moveDown}
                >
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

                <DropdownMenuItem
                  className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
                  onClick={remove}
                >
                  <Trash size="sm" />
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
