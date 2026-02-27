import { Modal, ModalCloseButton, ModalContent, ModalHeader, ModalTitle } from '@xipkg/modal';
import { createPortal } from 'react-dom';
import { isMac } from '../../../utils';

const BACKDROP_Z = 9999;

interface HotkeyItem {
  keys: string[];
  description: string;
  category: string;
}

const modKey = isMac ? '⌘' : 'Ctrl';

const hotkeyCategories: HotkeyItem[] = [
  // Инструменты
  { keys: ['V'], description: 'Инструмент выбора', category: 'Инструменты' },
  { keys: ['H'], description: 'Инструмент рука', category: 'Инструменты' },
  { keys: ['P'], description: 'Перо', category: 'Инструменты' },
  { keys: ['T'], description: 'Текст', category: 'Инструменты' },
  { keys: ['G'], description: 'Фигуры', category: 'Инструменты' },
  { keys: ['A'], description: 'Стрелка', category: 'Инструменты' },
  { keys: ['E'], description: 'Ластик', category: 'Инструменты' },

  // Действия
  { keys: [modKey, 'A'], description: 'Выбрать все', category: 'Действия' },
  { keys: ['Escape'], description: 'Отменить выбор', category: 'Действия' },
  { keys: [modKey, 'D'], description: 'Дублировать', category: 'Действия' },
  { keys: ['Backspace'], description: 'Удалить выбранное', category: 'Действия' },
  { keys: [modKey, 'C'], description: 'Копировать', category: 'Действия' },
  { keys: ['Delete'], description: 'Удалить выбранное', category: 'Действия' },
  { keys: [modKey, 'V'], description: 'Вставить', category: 'Действия' },
  { keys: [modKey, 'Z'], description: 'Отменить', category: 'Действия' },
  { keys: [modKey, 'X'], description: 'Вырезать', category: 'Действия' },
  { keys: [modKey, 'Y'], description: 'Повторить', category: 'Действия' },
  { keys: [modKey, 'G'], description: 'Группировать/разгруппировать', category: 'Действия' },

  // Масштабирование
  { keys: [modKey, '+'], description: 'Увеличить масштаб', category: 'Масштабирование' },
  { keys: [modKey, '-'], description: 'Уменьшить масштаб', category: 'Масштабирование' },
  { keys: [modKey, '0'], description: 'Сбросить масштаб', category: 'Масштабирование' },
  { keys: [modKey, '1'], description: 'Подогнать по размеру', category: 'Масштабирование' },
];

const groupByCategory = (items: HotkeyItem[]) => {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, HotkeyItem[]>,
  );
};

const groupedHotkeys = groupByCategory(hotkeyCategories);

/** Общий контент модалки: только список горячих клавиш */
const HotkeysHelpBody = () => (
  <div className="space-y-6 overflow-auto p-6">
    {Object.entries(groupedHotkeys).map(([category, items]) => (
      <div key={category}>
        <h3 className="mb-3 text-lg font-semibold text-gray-100">{category}</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((item, index) => (
            <div key={index} className="bg-gray-5 flex items-center justify-between rounded-lg p-2">
              <span className="text-sm text-gray-700">{item.description}</span>
              <div className="flex gap-1">
                {item.keys.map((key, keyIndex) => (
                  <div key={keyIndex} className="flex items-center gap-1">
                    {keyIndex > 0 && <span className="text-gray-400">+</span>}
                    <kbd className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs shadow-sm">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export type HotkeysHelpModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Свой backdrop в body (z 9999, pointer-events: auto). Канвас tldraw и
 * Radix-оверлей могут перехватывать клики; этот слой поверх них, клик по нему
 * закрывает модалку. Контент модалки z-[10000], чтобы по окну не закрывать.
 */
export const HotkeysHelpModal = ({ open, onOpenChange }: HotkeysHelpModalProps) => (
  <>
    {open &&
      createPortal(
        <div
          role="presentation"
          aria-hidden
          className="fixed inset-0"
          style={{ zIndex: BACKDROP_Z, pointerEvents: 'auto' }}
          onClick={() => onOpenChange(false)}
        />,
        document.body,
      )}
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="z-10000 max-h-[80vh] max-w-4xl">
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle>Горячие клавиши</ModalTitle>
        </ModalHeader>
        <HotkeysHelpBody />
      </ModalContent>
    </Modal>
  </>
);
