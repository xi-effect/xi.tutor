// useBoardActions.ts
import { useParams } from '@tanstack/react-router';
import { useGetMaterial } from 'common.services';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useEditor } from 'tldraw';
import { useYjsContext } from '../../../../providers/YjsProvider';

export const useDropdownActions = () => {
  const editor = useEditor();
  const { boardId = 'empty' } = useParams({ strict: false });
  const { data } = useGetMaterial(boardId);
  const { isReadonly, toggleReadonly } = useYjsContext();

  useEffect(() => {
    editor.updateInstanceState({ isReadonly });
  }, [editor, isReadonly]);

  const saveCanvas = async () => {
    if (!editor) return;

    try {
      toast.info('Начинаем экспорт доски...');

      // Получаем все ID фигур на текущей странице
      const shapeIds = editor.getCurrentPageShapeIds();

      if (shapeIds.size === 0) {
        toast.error('На доске нет элементов для экспорта');
        return;
      }

      // Экспортируем в PNG используя правильный API tldraw
      const { blob } = await editor.toImage([...shapeIds], {
        format: 'png',
        background: true,
        scale: 2,
        padding: 20,
      });

      // Создаем ссылку для скачивания с названием доски
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = data?.name ? `${data.name}.png` : `board-${Date.now()}.png`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Доска успешно экспортирована!');
    } catch (error) {
      console.error('Ошибка при экспорте доски:', error);
      toast.error('Ошибка при экспорте доски');
    }
  };

  const clearBoard = () => {
    if (!editor) return;

    try {
      // Получаем все ID фигур на текущей странице
      const shapeIds = editor.getCurrentPageShapeIds();

      if (shapeIds.size === 0) {
        toast.info('Доска уже пуста');
        return;
      }

      // Удаляем все фигуры
      editor.deleteShapes([...shapeIds]);
      toast.success('Доска очищена!');
    } catch (error) {
      console.error('Ошибка при очистке доски:', error);
      toast.error('Ошибка при очистке доски');
    }
  };

  return { toggleReadonly, saveCanvas, clearBoard, isReadonly };
};
