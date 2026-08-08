/**
 * @fileoverview Утилиты для работы с форматированием richText и маркдауном
 */

import { DrRichTextWithNodesT, MarkFormatT, RichNodeT } from '../types';

type ToggleMarkTypeT = {
  richTexts: DrRichTextWithNodesT[];
  format: MarkFormatT;
  isReset: boolean;
  link?: string;
};

/**
 * Рекурсивно собирает все текстовые узлы из структуры richText.
 *
 * @description Функция обходит дерево контента в глубину (DFS) и собирает все узлы типа 'text'.
 *
 * @param {DrRichTextWithNodesT[]} richTexts - Массив объектов richText для обработки.
 * @returns {RichNodeT[]} Массив всех текстовых узлов, найденных в переданных richTexts.
 */
const getTextNodes = (richTexts: DrRichTextWithNodesT[]): RichNodeT[] => {
  const textNodes: RichNodeT[] = [];

  richTexts.forEach((richText) => {
    const stack = [...richText.content];

    while (stack.length > 0) {
      const node = stack.pop();

      if (node?.type === 'text') {
        textNodes.push(node);
      }

      if (node?.content && Array.isArray(node.content)) {
        for (let i = node.content.length - 1; i >= 0; i -= 1) {
          stack.push(node.content[i]);
        }
      }
    }
  });

  return textNodes;
};

/**
 * Получает массив уникальных форматов, примененных в переданных richTexts.
 *
 * @description Функция сканирует все текстовые узлы и собирает уникальные типы форматирования
 * ('bold', 'italic', 'link' и т.д.), которые используются в переданных richTexts.
 *
 * @param {DrRichTextWithNodesT[]} richTexts - Массив объектов richText для сканирования
 * @returns {MarkFormatT[]} Массив уникальных форматов, примененных к тексту
 */
export const getMarkTypes = (richTexts: DrRichTextWithNodesT[]): MarkFormatT[] => {
  const allTextNodes = getTextNodes(richTexts);

  const allMarkTypesSet = allTextNodes.reduce((sum, textNode) => {
    textNode.marks?.forEach((mark) => sum.add(mark.type));

    return sum;
  }, new Set<MarkFormatT>());

  return [...allMarkTypesSet];
};

/**
 * Переключает форматирование для всех переданных richTexts без мутации исходных данных
 *
 * @description Функция создает глубокую копию переданных richTexts и применяет или удаляет
 * указанный формат для всех текстовых узлов. При добавлении формата 'link' автоматически
 * добавляются стандартные атрибуты для ссылки (href, target, rel и т.д.).
 *
 * @param {Object} params - Параметры переключения формата
 * @param {DrRichTextWithNodesT[]} params.richTexts - Массив richText для обработки
 * @param {MarkFormatT} params.format - Тип форматирования для переключения (bold, italic, link, и т.д.)
 * @param {boolean} params.isReset - Если true - удаляет формат, если false - добавляет
 * @param {string} [params.link=''] - URL для ссылки (используется только при format === 'link')
 * @returns {DrRichTextWithNodesT[]} Новая структура richText с примененными изменениями
 */
export const toggleMarkType = ({
  richTexts,
  format,
  isReset,
  link = '',
}: ToggleMarkTypeT): DrRichTextWithNodesT[] => {
  const richTextsClone = structuredClone(richTexts);

  getTextNodes(richTextsClone).forEach((textNode) => {
    const formatIsExist = textNode.marks && textNode.marks.some((mark) => mark.type === format);

    if (!textNode.marks) textNode.marks = [];

    if (formatIsExist && isReset) {
      textNode.marks = textNode.marks.filter((mark) => mark.type !== format);
    }
    if (!formatIsExist && !isReset) {
      textNode.marks.push({
        type: format,
        attrs:
          format !== 'link'
            ? {}
            : {
                href: link,
                target: '_blank',
                rel: 'noopener noreferrer nofollow',
                class: null,
                title: null,
              },
      });
    }
  });

  return richTextsClone;
};

/**
 * Проверяет наличие 'bulletList' узла в переданных richTexts
 *
 * @description Функция обходит структуру контента в поисках узлов с type ==='bulletList'
 *
 * @param {DrRichTextWithNodesT[]} richTexts - Массив richText для проверки
 * @returns {boolean} true - если найден хотя бы один узел с type ==='bulletList', false - в противном случае
 */
export const hasBulletListNode = (richTexts: DrRichTextWithNodesT[]): boolean => {
  for (const richText of richTexts) {
    const stack = [...richText.content];

    while (stack.length > 0) {
      const node = stack.pop();

      if (node?.type === 'bulletList') {
        return true;
      }

      if (node?.content && Array.isArray(node.content)) {
        for (let i = node.content.length - 1; i >= 0; i -= 1) {
          stack.push(node.content[i]);
        }
      }
    }
  }

  return false;
};

/**
 * Добавляет 'bulletList' в корень структуры richText
 *
 * @description Функция создает глубокую копию richText и оборачивает richText.content
 * в структуру маркированного списка (bulletList → listItem).
 *
 * @param {DrRichTextWithNodesT[]} richTexts - Массив richText для преобразования
 * @returns {DrRichTextWithNodesT[]} Новая структура с 'bulletList' в корне.
 */
export const setBulletList = (richTexts: DrRichTextWithNodesT[]): DrRichTextWithNodesT[] => {
  const richTextsClone = structuredClone(richTexts);

  richTextsClone.forEach((richText) => {
    const paragrafs = richText.content;

    richText.content = [
      {
        type: 'bulletList',
        attrs: {
          dir: 'auto',
        },
        content: [
          {
            type: 'listItem',
            attrs: {
              dir: 'auto',
            },
            content: paragrafs,
          },
        ],
      },
    ];
  });

  return richTextsClone;
};

/**
 * Удаляет 'bulletList' и 'listItem' узлы из структуры, поднимая их дочерние узлы
 *
 * @description Функция создает глубокую копию richText и удаляет узлы 'bulletList' и 'listItem',
 * поднимая их содержимое на уровень выше.
 *
 * @param {DrRichTextWithNodesT[]} richTexts - Массив richText для преобразования
 * @returns {DrRichTextWithNodesT[]} Новая структура без 'bulletList' и 'listItem' узлов.
 */
export const unsetBulletList = (richTexts: DrRichTextWithNodesT[]): DrRichTextWithNodesT[] => {
  const richTextsClone = structuredClone(richTexts);

  richTextsClone.forEach((richText) => {
    removeNodesByType(richText);
  });

  return richTextsClone;
};

/**
 * Рекурсивно удаляет узлы с указанными типами и поднимает их содержимое
 *
 * @description Вспомогательная функция для unsetBulletList. Рекурсивно обходит структуру
 * узла и удаляет узлы типов 'bulletList' и 'listItem', при этом их содержимое
 * поднимается на уровень родительского узла.
 *
 * @param {DrRichTextWithNodesT} richText - Объект richText для обработки
 * @returns {DrRichTextWithNodesT} richText (мутирует переданный объект)
 *
 * @private
 * @see {@link unsetBulletList}
 */
const removeNodesByType = (richText: DrRichTextWithNodesT): DrRichTextWithNodesT => {
  const typesSet = new Set(['bulletList', 'listItem']);

  const processNode = (node: RichNodeT) => {
    if (node.content) {
      const newContent = [];

      for (const child of node.content) {
        const processed = processNode(child);

        if (processed) {
          newContent.push(processed);
        } else if (child.content) {
          for (const grandChild of child.content) {
            const processedGrandChild = processNode(grandChild);

            if (processedGrandChild) {
              newContent.push(processedGrandChild);
            }
          }
        }
      }

      node.content = newContent;
    }

    if (typesSet.has(node.type)) return null;

    return node;
  };

  processNode(richText);

  return richText;
};
