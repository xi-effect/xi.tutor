import { useEditor } from 'tldraw';
import { useEffect } from 'react';
import { useTldrawStore } from '../store';
import { isEditableTarget } from '../utils';
import { useYjsContext } from '../providers/YjsProvider';

export const useHotkeys = () => {
  const editor = useEditor();
  const { selectedElementId, selectElement, setSelectedTool } = useTldrawStore();
  const { undo, redo } = useYjsContext();

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Предотвращаем срабатывание в полях ввода
      if (isEditableTarget(event.target)) return;

      const { key, ctrlKey, shiftKey, metaKey, altKey } = event;

      const modKey = ctrlKey || metaKey;

      if (key === 'z' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        undo();
        return;
      }

      if ((key === 'z' && modKey && shiftKey) || (key === 'y' && modKey && !shiftKey)) {
        event.preventDefault();
        redo();
        return;
      }

      // Основные инструменты
      if (key === 'v' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('select');
        setSelectedTool('select');
        return;
      }

      if (key === 'h' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('hand');
        setSelectedTool('hand');
        return;
      }

      if (key === 'p' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('draw');
        setSelectedTool('pen');
        return;
      }

      if (key === 't' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('text');
        setSelectedTool('text');
        return;
      }

      if (key === 'g' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('geo');
        setSelectedTool('geo');
        return;
      }

      if (key === 'a' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('arrow');
        setSelectedTool('arrow');
        return;
      }

      if (key === 'e' && !modKey && !shiftKey && !altKey) {
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
      if (key === 'a' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
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
      if (key === '=' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.zoomIn();
        return;
      }

      if (key === '-' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.zoomOut();
        return;
      }

      if (key === '0' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.resetZoom();
        return;
      }

      if (key === '1' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.zoomToFit();
        return;
      }

      // Дублирование элементов
      if (key === 'd' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        const selectedShapes = editor.getSelectedShapes();
        if (selectedShapes.length > 0) {
          editor.duplicateShapes(selectedShapes);
        }
        return;
      }

      // Группировка/разгруппировка
      if (key === 'g' && modKey && !shiftKey && !altKey) {
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
        event.preventDefault();
        const customEvent = new CustomEvent('openHotkeysHelp');
        window.dispatchEvent(customEvent);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, selectedElementId, selectElement, setSelectedTool, undo, redo]);
};
