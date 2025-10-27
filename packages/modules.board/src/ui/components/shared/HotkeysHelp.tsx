import { Button } from '@xipkg/button';
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@xipkg/modal';
import { InfoCircle } from '@xipkg/icons';
import { useEffect } from 'react';
import { isMac } from '../../../utils';

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

export const HotkeysHelp = () => {
  // const [open, setOpen] = useState(false);
  const groupedHotkeys = groupByCategory(hotkeyCategories);

  // Обработка события от горячей клавиши F1
  useEffect(() => {
    const handleOpenHotkeysHelp = () => {
      // setOpen(true);
    };

    window.addEventListener('openHotkeysHelp', handleOpenHotkeysHelp);
    return () => {
      window.removeEventListener('openHotkeysHelp', handleOpenHotkeysHelp);
    };
  }, []);

  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="ghost" className="h-[40px] w-[40px] p-2">
          <InfoCircle size="s" />
        </Button>
      </ModalTrigger>
      <ModalContent className="max-h-[80vh] max-w-4xl">
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle>Горячие клавиши</ModalTitle>
        </ModalHeader>
        <div className="space-y-6 overflow-auto p-6">
          {Object.entries(groupedHotkeys).map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-3 text-lg font-semibold text-gray-100">{category}</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-5 flex items-center justify-between rounded-lg p-2"
                  >
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
      </ModalContent>
    </Modal>
  );
};
