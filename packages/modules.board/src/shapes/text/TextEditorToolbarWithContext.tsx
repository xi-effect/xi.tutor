import { useCallback, useState } from 'react';
import { useEditorState } from '@tiptap/react';
import { DefaultRichTextToolbar, useEditor, useValue, TiptapEditor } from '@ibodr/draw';
import { Ul } from '@xipkg/icons';
import { textFormatterElements } from './textFormatterElements';
import { NavbarButton } from '../../ui/components/shared';
import { LinkNavbarButton } from './LinkNavbarButton';
import { MathFormatToolbar } from './MathFormatToolbar';
import { TextFormattingBar } from './HighlightStyleMenu';
import { useHighlightStyleMenu, useToggleFormat } from './hooks';
import { activeHighlightStyle } from '../../store/useTextHighlightStore';
import { MarkFormatT } from './types';
import { hasFormat } from './utils/textEditorUtils';
import { applyHighlightToSelection, readEditorHighlightStyle } from './highlightStyle';

export const TextEditorToolbarWithContext = () => {
  const [link, setLink] = useState('');
  const [open, setOpen] = useState(false);
  const editor = useEditor();
  const textEditor = useValue<TiptapEditor | null>('textEditor', () => editor.getRichTextEditor(), [
    editor,
  ]);
  const { toggleFormatHandler } = useToggleFormat(textEditor);

  const editorState = useEditorState({
    editor: textEditor,
    selector: (ctx) => {
      return {
        // Mark types
        bold: hasFormat(ctx.editor, 'bold'),
        italic: hasFormat(ctx.editor, 'italic'),
        strike: hasFormat(ctx.editor, 'strike'),
        underline: hasFormat(ctx.editor, 'underline'),
        highlight: hasFormat(ctx.editor, 'highlight'),
        highlightStyle: readEditorHighlightStyle(ctx.editor),
        selectionKey: ctx.editor
          ? `${ctx.editor.state.selection.from}:${ctx.editor.state.selection.to}`
          : 'none',
        link: hasFormat(ctx.editor, 'link'),
        superscript: hasFormat(ctx.editor, 'superscript'),
        subscript: hasFormat(ctx.editor, 'subscript'),

        // Node types
        bulletList: hasFormat(ctx.editor, 'bulletList'),
      };
    },
  });
  const {
    open: highlightMenuOpen,
    toggle: toggleHighlightMenu,
    close: closeHighlightMenu,
  } = useHighlightStyleMenu(editorState?.selectionKey ?? 'none');

  const changeLinkHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLink(e.target.value);
  };

  const toggleLinkHandler = useCallback(() => {
    closeHighlightMenu();

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
  }, [closeHighlightMenu, open, textEditor, toggleFormatHandler]);

  const setLinkHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!textEditor) return;

    if (e.key === 'Enter') {
      closeHighlightMenu();
      toggleFormatHandler('link', link);
      setLink('');
      setOpen(false);
    }
  };

  const toggleHighlightHandler = () => {
    const opened = toggleHighlightMenu();
    if (!opened) return;

    if (open) {
      setOpen(false);
      setLink('');
    }

    if (!textEditor || hasFormat(textEditor, 'highlight')) return;
    applyHighlightToSelection(textEditor, activeHighlightStyle());
  };

  const toggleFormat = (format: MarkFormatT) => () => {
    closeHighlightMenu();
    toggleFormatHandler(format);
  };

  return (
    <DefaultRichTextToolbar>
      <TextFormattingBar
        highlightValue={editorState?.highlightStyle ?? null}
        highlightSourceId={editorState?.selectionKey ?? 'none'}
        highlightMenuOpen={highlightMenuOpen}
        onHighlightMenuClose={closeHighlightMenu}
        onHighlightChange={(style) => {
          if (!textEditor) return;
          applyHighlightToSelection(textEditor, style);
        }}
      >
        {textFormatterElements.map((element) => {
          const isHighlight = element.type === 'highlight';

          return (
            <NavbarButton
              key={element.type}
              icon={element.icon}
              title={element.title}
              isActive={
                isHighlight
                  ? !!editorState?.highlight || highlightMenuOpen
                  : !!editorState?.[element.type]
              }
              aria-expanded={isHighlight ? highlightMenuOpen : undefined}
              data-text-highlight-trigger={isHighlight ? '' : undefined}
              onClick={isHighlight ? toggleHighlightHandler : toggleFormat(element.type)}
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
        <MathFormatToolbar
          textEditor={textEditor}
          isSuperscript={!!editorState?.superscript}
          isSubscript={!!editorState?.subscript}
          onToggleSuperscript={toggleFormat('superscript')}
          onToggleSubscript={toggleFormat('subscript')}
        />
      </TextFormattingBar>
    </DefaultRichTextToolbar>
  );
};
