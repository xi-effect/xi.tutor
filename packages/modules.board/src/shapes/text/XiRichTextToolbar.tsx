import { useState } from 'react';
import { DefaultRichTextToolbar, useEditor, useValue, TiptapEditor } from '@ibodr/draw';
import { Button } from '@xipkg/button';
import { Bold, Edit, Italic, Link, Stroke, Ul, Underline } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';

// Временное решение. Правильный тип для extensions @tiptap нужно задекларировать в @ibodr
interface IChainedCommandsFallback {
  setLink?: ({ href }: { href: string }) => { run: () => void };
  toggleBulletList?: () => { run: () => void };
  toggleBold?: () => { run: () => void };
  toggleItalic?: () => { run: () => void };
  toggleStrike?: () => { run: () => void };
  toggleUnderline?: () => { run: () => void };
  toggleHighlight?: () => { run: () => void };
}

const DEFAULT_LINK = 'https://';

export const XiRichTextToolbar = () => {
  const editor = useEditor();
  const textEditor = useValue<TiptapEditor | null>('textEditor', () => editor.getRichTextEditor(), [
    editor,
  ]);
  const isBulletListActive = textEditor?.isActive('bulletList');
  const [link, setLink] = useState(DEFAULT_LINK);

  const handleChangeLink = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLink(e.target.value);
  };

  const handleSetLink = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!textEditor) return;

    if (e.key === 'Enter') {
      (textEditor.chain().extendMarkRange('link') as IChainedCommandsFallback)
        .setLink?.({ href: link })
        .run();
      setLink(DEFAULT_LINK);
    }
  };

  const toggleBulletList = () => {
    if (textEditor && 'toggleBulletList' in textEditor.chain()) {
      (textEditor.chain().focus() as IChainedCommandsFallback).toggleBulletList?.().run();
    }
  };

  return (
    <DefaultRichTextToolbar>
      <Button
        variant="none"
        size="s"
        aria-label="Жирный"
        onClick={() =>
          (textEditor?.chain().focus() as IChainedCommandsFallback).toggleBold?.().run()
        }
      >
        <Bold />
      </Button>

      <Button
        variant="none"
        size="s"
        aria-label="Курсив"
        onClick={() =>
          (textEditor?.chain().focus() as IChainedCommandsFallback).toggleItalic?.().run()
        }
      >
        <Italic />
      </Button>

      <Button
        variant="none"
        size="s"
        aria-label="Зачёркнутый"
        onClick={() =>
          (textEditor?.chain().focus() as IChainedCommandsFallback).toggleStrike?.().run()
        }
      >
        <Stroke />
      </Button>

      <Button
        variant="none"
        size="s"
        aria-label="Подчёркнутый"
        onClick={() =>
          (textEditor?.chain().focus() as IChainedCommandsFallback).toggleUnderline?.().run()
        }
      >
        <Underline />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="none" size="s" aria-label="Link">
            <Link />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Input
            placeholder="Введите ссылку и нажмите 'Enter'"
            value={link}
            onChange={handleChangeLink}
            onKeyDown={handleSetLink}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="none"
        size="s"
        aria-label="Список"
        onClick={toggleBulletList}
        style={isBulletListActive ? { background: 'rgba(0,0,0,0.1)' } : undefined}
      >
        <Ul />
      </Button>

      <Button
        variant="none"
        size="s"
        aria-label="Выделение"
        onClick={() =>
          (textEditor?.chain().focus() as IChainedCommandsFallback).toggleHighlight?.().run()
        }
      >
        <Edit />
      </Button>
    </DefaultRichTextToolbar>
  );
};
