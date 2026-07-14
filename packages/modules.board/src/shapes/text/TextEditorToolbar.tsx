import { Edit, Ul } from '@xipkg/icons';
import { Editor, useValue } from '@ibodr/draw';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { NavbarButton } from '../../ui/components/shared';
import { textFormatterElements } from './textFormatterElements';
import { LinkNavbarButton } from './LinkNavbarButton';
import { useActiveStatuses } from './hooks';
import { useEffect, useState } from 'react';
import { setBulletList, toggleMarkType, unsetBulletList } from './utils/richTextUtils';
import { getShapesWithRichText } from './utils/shapeUtils';
import { MarkFormatT, ShapeTypesWithRichTextT } from './types';
import { normalizeLink } from './utils/linkUtils';

export const TextEditorToolbar = ({ editor }: { editor: Editor }) => {
  const [link, setLink] = useState('');
  const [open, setOpen] = useState(false);
  const { activeStatuses, updateActiveStatuses } = useActiveStatuses(editor);

  // Если кликнуть с одного richText на другой, то toolbar не будет размонтирован, а перенесется на другой richText
  // Для обновления активных статусов отслеживаем выделенные фигуры
  const selectedShapes = useValue('selectedShapes', () => editor.getSelectedShapes(), [editor]);

  useEffect(() => {
    updateActiveStatuses();
  }, [updateActiveStatuses, selectedShapes]);

  const changeLinkHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLink(e.target.value);
  };

  const toggleBulletListHandler = () => {
    const shapes = getShapesWithRichText(editor.getSelectedShapes());
    const richTexts = shapes.map((shape) => shape.props.richText);
    const formattedRichTexts = activeStatuses.bulletList
      ? unsetBulletList(richTexts)
      : setBulletList(richTexts);

    const updates = shapes.map((shape, index) => ({
      id: shape.id,
      type: shape.type as ShapeTypesWithRichTextT,
      props: {
        ...shape.props,
        richText: formattedRichTexts[index],
      },
    }));

    editor.updateShapes(updates);

    updateActiveStatuses();
  };

  const toggleFormatHandler = (format: MarkFormatT) => {
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
        ...shape.props,
        richText: formattedRichTexts[index],
      },
    }));

    editor.updateShapes(updates);

    updateActiveStatuses();
  };

  const setLinkToRichTextHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      toggleFormatHandler('link');
      setOpen(false);
      setLink('');
    }
  };

  const toggleLinkHandler = () => {
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
    <Popover>
      <PopoverTrigger asChild>
        <NavbarButton
          icon={<Edit className="size-6" />}
          isActive={open}
          className="data-[state=open]:bg-brand-0"
          title="Форматирование текста"
        ></NavbarButton>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="border-gray-10 bg-gray-0 flex w-full gap-1 rounded-xl border p-1 shadow-md"
      >
        {textFormatterElements.map((element) => {
          return (
            <NavbarButton
              key={element.type}
              icon={element.icon}
              title={element.title}
              isActive={activeStatuses[element.type]}
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
      </PopoverContent>
    </Popover>
  );
};
