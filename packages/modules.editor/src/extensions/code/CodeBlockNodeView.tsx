import { NodeViewWrapper, NodeViewProps, NodeViewContent } from '@tiptap/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { MoreVert, Copy, Trash } from '@xipkg/icons';
import { useBlockMenuActions, useYjsContext } from '../../hooks';
import { cn } from '@xipkg/utils';
import { useCallback, useState } from 'react';
import { ActiveBlockT } from '../../types';
import { common } from 'lowlight';
import { toast } from 'sonner';

export const CodeBlockNodeView = ({ node, getPos, updateAttributes }: NodeViewProps) => {
  const [hovered, setHovered] = useState(false);
  const currentLang = node.attrs.language || 'plaintext';

  const { editor, isReadOnly } = useYjsContext();

  // Функция точного определения текущего блока для хука экшенов
  const getActiveBlock = useCallback((): ActiveBlockT | undefined => {
    if (typeof getPos !== 'function' || !editor) return;
    try {
      const pos = getPos();
      if (pos == null || pos < 0) return;
      const { doc } = editor.state;
      if (pos >= doc.content.size) return;

      const $pos = doc.resolve(pos);
      const nodeAtPos = $pos.nodeAfter;

      if (nodeAtPos?.type.name === 'codeBlock') {
        return { editor, node: nodeAtPos, pos };
      }
    } catch {
      return;
    }
  }, [editor, getPos]);

  const { remove } = useBlockMenuActions(editor, getActiveBlock);

  // Копирование содержимого блока кода в буфер обмена
  const handleCopyCode = () => {
    const codeText = node.textContent;
    navigator.clipboard.writeText(codeText);
    toast.success('Код скопирован в буфер обмена');
  };

  // Изменение языка через встроенный метод Tiptap `updateAttributes`
  const handleLanguageChange = (newLang: string) => {
    updateAttributes({ language: newLang });
  };

  const availableLanguages = Object.keys(common);

  return (
    <NodeViewWrapper
      className="group border-gray-10 bg-gray-0 relative my-4 rounded-xl border p-4 font-mono text-sm"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={cn(
          'absolute top-3 right-3 z-10 flex items-center gap-1 transition-opacity duration-200',
          hovered ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        contentEditable={false}
      >
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              size="s"
              variant="none"
              className="border-gray-10 h-6 rounded border px-2 text-xs text-gray-100 capitalize"
              disabled={isReadOnly}
            >
              {currentLang === 'plaintext' ? 'text' : currentLang}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            className="border-gray-10 flex max-h-[240px] w-[150px] flex-col space-y-1 overflow-y-auto rounded-xl border p-1 text-gray-100"
          >
            <DropdownMenuItem
              className="hover:bg-gray-5 h-7 rounded px-2 text-xs"
              onSelect={() => handleLanguageChange('plaintext')}
            >
              Plain text
            </DropdownMenuItem>
            {availableLanguages.map((lang) => (
              <DropdownMenuItem
                key={lang}
                className="hover:bg-gray-5 h-7 rounded px-2 text-xs capitalize"
                onSelect={() => handleLanguageChange(lang)}
              >
                {lang}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="s" variant="none" className="h-6 rounded px-1.5 text-gray-100">
              <MoreVert size="sm" className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            className="border-gray-10 flex w-[160px] flex-col space-y-1 rounded-xl border p-2"
          >
            <DropdownMenuItem
              className="hover:bg-gray-5 h-7 gap-2 rounded p-1"
              onSelect={handleCopyCode}
            >
              <Copy size="sm" className="size-4" />
              <span className="text-xs">Копировать</span>
            </DropdownMenuItem>

            {!isReadOnly && (
              <DropdownMenuItem
                className="hover:bg-gray-5 h-7 gap-2 rounded p-1 text-red-500"
                onSelect={remove}
              >
                <Trash size="sm" className="size-4 text-red-500" />
                <span className="text-xs">Удалить блок</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Обязательный контейнер Tiptap для рендеринга редактируемого текста */}
      <pre className="font-inherit m-0 bg-transparent p-0 text-inherit">
        <NodeViewContent className="text-inherit" />
      </pre>
    </NodeViewWrapper>
  );
};
