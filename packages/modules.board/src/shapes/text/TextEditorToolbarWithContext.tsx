import { useCallback, useState } from 'react';
import { useEditorState } from '@tiptap/react';
import { DefaultRichTextToolbar, useEditor, useValue, TiptapEditor } from '@ibodr/draw';
import { Ul } from '@xipkg/icons';
import { textFormatterElements } from './textFormatterElements';
import { NavbarButton } from '../../ui/components/shared';
import { LinkNavbarButton } from './LinkNavbarButton';
import { useToggleFormat } from './hooks';
import { ActiveFormatesMapT, MarkFormatT } from './types';
import { hasFormat } from './utils/textEditorUtils';

export const TextEditorToolbarWithContext = () => {
  const [link, setLink] = useState('');
  const [open, setOpen] = useState(false);
  const editor = useEditor();
  const textEditor = useValue<TiptapEditor | null>('textEditor', () => editor.getRichTextEditor(), [
    editor,
  ]);
  const { toggleFormatHandler } = useToggleFormat(textEditor);

  const editorState: ActiveFormatesMapT | null = useEditorState({
    editor: textEditor,
    selector: (ctx) => {
      return {
        // Mark types
        bold: hasFormat(ctx.editor, 'bold'),
        italic: hasFormat(ctx.editor, 'italic'),
        strike: hasFormat(ctx.editor, 'strike'),
        underline: hasFormat(ctx.editor, 'underline'),
        highlight: hasFormat(ctx.editor, 'highlight'),
        link: hasFormat(ctx.editor, 'link'),

        // Node types
        bulletList: hasFormat(ctx.editor, 'bulletList'),
      };
    },
  });

  const changeLinkHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLink(e.target.value);
  };

  const toggleLinkHandler = useCallback(() => {
    if (open) {
      setOpen(false);
      setLink('');

      return;
    }

    if (hasFormat(textEditor, 'link')) {
      toggleFormatHandler('link');
    } else {
      setOpen(true);
    }
  }, [open, textEditor, toggleFormatHandler]);

  const setLinkHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!textEditor) return;

    if (e.key === 'Enter') {
      toggleFormatHandler('link', link);
      setLink('');
      setOpen(false);
    }
  };

  const toggleFormat = (format: MarkFormatT) => () => {
    toggleFormatHandler(format);
  };

  return (
    <DefaultRichTextToolbar>
      <div className="bg-gray-0 flex gap-1 p-1">
        {textFormatterElements.map((element) => {
          return (
            <NavbarButton
              key={element.type}
              icon={element.icon}
              title={element.title}
              isActive={!!editorState?.[element.type]}
              onClick={toggleFormat(element.type)}
            />
          );
        })}
        <NavbarButton
          icon={<Ul />}
          title="Список"
          isActive={!!editorState?.bulletList}
          onClick={toggleFormat('bulletList')}
        />
        <LinkNavbarButton
          open={open}
          setOpen={setOpen}
          link={link}
          onChange={changeLinkHandler}
          onKeyDown={setLinkHandler}
          onClick={toggleLinkHandler}
          isActive={!!editorState?.link}
        />
      </div>
    </DefaultRichTextToolbar>
  );
};
