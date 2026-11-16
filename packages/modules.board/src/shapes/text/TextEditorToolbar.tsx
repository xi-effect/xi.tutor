import { Edit, Ul } from '@xipkg/icons';
import { Editor, useValue, type DrNoteShape } from '@ibodr/draw';
import { StickerTextFormatControls } from '../sticker/StickerTextFormatControls';
import { Button } from '@xipkg/button';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { NavbarButton } from '../../ui/components/shared';
import {
  boardSelectionToolbarButtonClass,
  boardSelectionToolbarIconClass,
} from '../../ui/boardTheme';
import { textFormatterElements } from './textFormatterElements';
import { LinkNavbarButton } from './LinkNavbarButton';
import { MathFormatToolbar } from './MathFormatToolbar';
import { TextFormattingBar } from './HighlightStyleMenu';
import { useActiveStatuses, useHighlightStyleMenu } from './hooks';
import { useEffect, useState } from 'react';
import { setBulletList, toggleMarkType, unsetBulletList } from './utils/richTextUtils';
import { getShapesWithRichText } from './utils/shapeUtils';
import { DrRichTextWithNodesT, MarkFormatT, ShapeTypesWithRichTextT } from './types';
import { normalizeLink } from './utils/linkUtils';
import { activeHighlightStyle } from '../../store/useTextHighlightStore';
import {
  applyHighlightStyle,
  hasHighlightMark,
  readCommonHighlightStyle,
  updateExistingHighlight,
  type TextHighlightStyle,
} from './highlightStyle';

function isNestedTextMenu(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !!target.closest('[role="menu"], [role="listbox"], [data-text-highlight-menu]')
  );
}

export const TextEditorToolbar = ({ editor }: { editor: Editor }) => {
  const [link, setLink] = useState('');
  const [open, setOpen] = useState(false);
  const { activeStatuses, updateActiveStatuses } = useActiveStatuses(editor);

  // Если кликнуть с одного richText на другой, то toolbar не будет размонтирован, а перенесется на другой richText
  // Для обновления активных статусов отслеживаем выделенные фигуры
  const selectedShapes = useValue('selectedShapes', () => editor.getSelectedShapes(), [editor]);
  const notes = selectedShapes.filter((shape): shape is DrNoteShape => shape.type === 'note');
  const richTextShapes = getShapesWithRichText(selectedShapes);
  const highlightValue = readCommonHighlightStyle(
    richTextShapes.map((shape) => shape.props.richText),
  );
  const highlightSourceId = richTextShapes.map((shape) => shape.id).join(',');
  const {
    open: highlightMenuOpen,
    toggle: toggleHighlightMenu,
    close: closeHighlightMenu,
  } = useHighlightStyleMenu(highlightSourceId);

  useEffect(() => {
    updateActiveStatuses();
  }, [updateActiveStatuses, selectedShapes]);

  const changeLinkHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLink(e.target.value);
  };

  const commitRichText = (richTexts: DrRichTextWithNodesT[]) => {
    const shapes = getShapesWithRichText(editor.getSelectedShapes());
    if (shapes.length !== richTexts.length) return;

    editor.updateShapes(
      shapes.map((shape, index) => ({
        id: shape.id,
        type: shape.type as ShapeTypesWithRichTextT,
        props: {
          richText: richTexts[index],
        },
      })),
    );
    updateActiveStatuses();
  };

  const toggleHighlightHandler = () => {
    const opened = toggleHighlightMenu();
    if (!opened) return;

    if (open) setOpen(false);

    const shapes = getShapesWithRichText(editor.getSelectedShapes());
    const richTexts = shapes.map((shape) => shape.props.richText);
    if (hasHighlightMark(richTexts)) return;

    commitRichText(applyHighlightStyle(richTexts, highlightValue ?? activeHighlightStyle()));
  };

  const changeHighlightHandler = (style: TextHighlightStyle) => {
    const shapes = getShapesWithRichText(editor.getSelectedShapes());
    const richTexts = shapes.map((shape) => shape.props.richText);
    const formatted = hasHighlightMark(richTexts)
      ? updateExistingHighlight(richTexts, style)
      : applyHighlightStyle(richTexts, style);

    commitRichText(formatted);
  };

  const toggleBulletListHandler = () => {
    closeHighlightMenu();
    const shapes = getShapesWithRichText(editor.getSelectedShapes());
    const richTexts = shapes.map((shape) => shape.props.richText);
    const formattedRichTexts = activeStatuses.bulletList
      ? unsetBulletList(richTexts)
      : setBulletList(richTexts);

    const updates = shapes.map((shape, index) => ({
      id: shape.id,
      type: shape.type as ShapeTypesWithRichTextT,
      props: {
        richText: formattedRichTexts[index],
      },
    }));

    editor.updateShapes(updates);

    updateActiveStatuses();
  };

  const toggleFormatHandler = (format: MarkFormatT) => {
    if (format === 'highlight') {
      toggleHighlightHandler();
      return;
    }

    closeHighlightMenu();
    if (open) setOpen(false);

    const shapes = getShapesWithRichText(editor.getSelectedShapes());
    const richTexts = shapes.map((shape) => shape.props.richText);

    // Определяем режим переключения
    const hasFormat = activeStatuses[format];
    const formattedRichTexts = toggleMarkType({
      richTexts,
      format,
      isReset: hasFormat,
      link: normalizeLink(link),
    });

    const updates = shapes.map((shape, index) => ({
      id: shape.id,
      type: shape.type as ShapeTypesWithRichTextT,
      props: {
        richText: formattedRichTexts[index],
      },
    }));

    editor.updateShapes(updates);

    updateActiveStatuses();
  };

  const setLinkToRichTextHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      toggleFormatHandler('link');
      setOpen(false);
      setLink('');
    }
  };

  const toggleLinkHandler = () => {
    closeHighlightMenu();

    if (open) {
      setOpen(false);
      setLink('');

      return;
    }

    if (activeStatuses.link) {
      toggleFormatHandler('link');
      setLink('');

      return;
    }

    setOpen(true);
  };

  return (
    <Popover
      onOpenChange={(next) => {
        if (!next) closeHighlightMenu();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="none"
          size="s"
          className={boardSelectionToolbarButtonClass}
          title="Форматирование текста"
        >
          <Edit className={boardSelectionToolbarIconClass} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="w-auto border-0 bg-transparent p-0 shadow-none"
        onPointerDownOutside={(event) => {
          if (isNestedTextMenu(event.target)) event.preventDefault();
        }}
        onFocusOutside={(event) => {
          if (isNestedTextMenu(event.target)) event.preventDefault();
        }}
      >
        <TextFormattingBar
          highlightValue={highlightValue}
          highlightSourceId={highlightSourceId}
          highlightMenuOpen={highlightMenuOpen}
          onHighlightMenuClose={closeHighlightMenu}
          onHighlightChange={changeHighlightHandler}
        >
          <StickerTextFormatControls editor={editor} notes={notes} />
          {textFormatterElements.map((element) => {
            const isHighlight = element.type === 'highlight';

            return (
              <NavbarButton
                key={element.type}
                icon={element.icon}
                title={element.title}
                isActive={
                  isHighlight
                    ? activeStatuses.highlight || highlightMenuOpen
                    : activeStatuses[element.type]
                }
                aria-expanded={isHighlight ? highlightMenuOpen : undefined}
                data-text-highlight-trigger={isHighlight ? '' : undefined}
                onClick={() => toggleFormatHandler(element.type)}
              />
            );
          })}
          <NavbarButton
            icon={<Ul />}
            title="Список"
            isActive={activeStatuses['bulletList']}
            onClick={toggleBulletListHandler}
          />
          <LinkNavbarButton
            open={open}
            setOpen={setOpen}
            link={link}
            onChange={changeLinkHandler}
            onKeyDown={setLinkToRichTextHandler}
            onClick={toggleLinkHandler}
            isActive={activeStatuses['link']}
          />
          <MathFormatToolbar
            textEditor={editor.getRichTextEditor()}
            isSuperscript={activeStatuses.superscript}
            isSubscript={activeStatuses.subscript}
            onToggleSuperscript={() => toggleFormatHandler('superscript')}
            onToggleSubscript={() => toggleFormatHandler('subscript')}
          />
        </TextFormattingBar>
      </PopoverContent>
    </Popover>
  );
};
