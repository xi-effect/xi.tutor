import { TiptapEditor } from '@ibodr/draw';
import { MarkFormatT } from '../types';

/**
 * Проверяет наличие указанного форматирования в выделенной части richText
 *
 * @description Функция проверяет текущую выделенную часть richText в редакторе Tiptap и определяет,
 * применено ли указанное форматирование ('bold', 'italic'', 'list и т.д.) к выделенному тексту.
 * Для 'bulletList' используется специальная проверка через nodesBetween, т.к. это тип узла, а не метка.
 *
 * @param {TiptapEditor | null} textEditor - Экземпляр редактора Tiptap или null
 * @param {MarkFormatT} format - Тип форматирования для проверки
 * (bold, italic, link, bulletList и т.д.)
 * @returns {boolean} true - если формат применен к выделенной части richText, false - в противном случае
 */
export const hasFormat = (textEditor: TiptapEditor | null, format: MarkFormatT): boolean => {
  if (!textEditor) return false;

  const { from, to } = textEditor.state.selection;

  if (format === 'bulletList') {
    let result = false;

    textEditor.state.doc.nodesBetween(from, to, (node) => {
      if (node.type.name === 'bulletList') {
        result = true;
      }
    });

    return result;
  }

  const markFormat = textEditor.schema?.marks[format];
  if (!markFormat) return false;

  return textEditor.state.doc.rangeHasMark(from, to, markFormat);
};
