import { useEditor } from 'tldraw';
import { useEffect } from 'react';
import { useTldrawStore } from '../store';
import { isEditableTarget } from '../utils';

export const useHotkeys = () => {
  const editor = useEditor();
  const { selectedElementId, selectElement, setSelectedTool } = useTldrawStore();

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Предотвращаем срабатывание в полях ввода
      if (isEditableTarget(event.target)) return;

      const { key, ctrlKey, shiftKey, altKey } = event;

      // Основные инструменты
      if (key === 'v' && !ctrlKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('select');
        setSelectedTool('select');
        return;
      }

      if (key === 'h' && !ctrlKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('hand');
        setSelectedTool('hand');
        return;
      }

      if (key === 'p' && !ctrlKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('draw');
        setSelectedTool('pen');
        return;
      }

      if (key === 't' && !ctrlKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('text');
        setSelectedTool('text');
        return;
      }

      if (key === 'g' && !ctrlKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('geo');
        setSelectedTool('geo');
        return;
      }

      if (key === 'a' && !ctrlKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('arrow');
        setSelectedTool('arrow');
        return;
      }

      if (key === 'e' && !ctrlKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('eraser');
        setSelectedTool('eraser');
        return;
      }

      // Удаление
      if (key === 'Delete' || key === 'Backspace') {
        const selectedShapes = editor.getSelectedShapes();
        if (selectedShapes.length > 0) {
          editor.deleteShapes(selectedShapes);
        } else if (selectedElementId) {
          try {
            // @ts-expect-error - selectedElementId может быть несовместим с новым API
            editor.deleteShapes([selectedElementId]);
          } catch (error) {
            console.warn('Could not delete shape:', error);
          }
        }
        selectElement(null);
        return;
      }

      // Выбор всех элементов
      if (key === 'a' && ctrlKey && !shiftKey && !altKey) {
        if (editor.getIsMenuOpen()) return;
        editor.selectAll();
        return;
      }

      // Отмена выбора
      if (key === 'Escape') {
        editor.selectNone();
        selectElement(null);
        return;
      }

      // Масштабирование
      if (key === '=' && ctrlKey && !shiftKey && !altKey) {
        editor.zoomIn();
        return;
      }

      if (key === '-' && ctrlKey && !shiftKey && !altKey) {
        editor.zoomOut();
        return;
      }

      if (key === '0' && ctrlKey && !shiftKey && !altKey) {
        editor.resetZoom();
        return;
      }

      if (key === '1' && ctrlKey && !shiftKey && !altKey) {
        editor.zoomToFit();
        return;
      }

      // Дублирование элементов
      if (key === 'd' && ctrlKey && !shiftKey && !altKey) {
        const selectedShapes = editor.getSelectedShapes();
        if (selectedShapes.length > 0) {
          editor.duplicateShapes(selectedShapes);
        }
        return;
      }

      // Группировка/разгруппировка
      if (key === 'g' && ctrlKey && !shiftKey && !altKey) {
        const selectedShapes = editor.getSelectedShapes();
        if (selectedShapes.length > 1) {
          if (editor.getShape(selectedShapes[0].id)?.type === 'group') {
            editor.ungroupShapes(selectedShapes);
          } else {
            editor.groupShapes(selectedShapes);
          }
        }
        return;
      }

      // Справка по горячим клавишам
      if (key === 'F1') {
        const customEvent = new CustomEvent('openHotkeysHelp');
        window.dispatchEvent(customEvent);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, selectedElementId, selectElement, setSelectedTool]);
};
