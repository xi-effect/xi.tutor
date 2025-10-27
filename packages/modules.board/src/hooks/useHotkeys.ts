import { TLShapeId, useEditor } from 'tldraw';
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
      if (isEditableTarget(event.target)) return;

      const { code, ctrlKey, shiftKey, metaKey, altKey } = event;
      const modKey = ctrlKey || metaKey;

      // Undo
      if (code === 'KeyZ' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        undo();
        return;
      }

      // Redo
      if ((code === 'KeyZ' && modKey && shiftKey) || (code === 'KeyY' && modKey && !shiftKey)) {
        event.preventDefault();
        redo();
        return;
      }

      // Основные инструменты
      if (code === 'KeyV' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('select');
        setSelectedTool('select');
        return;
      }

      if (code === 'KeyH' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('hand');
        setSelectedTool('hand');
        return;
      }

      if (code === 'KeyP' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('draw');
        setSelectedTool('pen');
        return;
      }

      if (code === 'KeyT' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('text');
        setSelectedTool('text');
        return;
      }

      if (code === 'KeyG' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('geo');
        setSelectedTool('geo');
        return;
      }

      if (code === 'KeyA' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('arrow');
        setSelectedTool('arrow');
        return;
      }

      if (code === 'KeyE' && !modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.setCurrentTool('eraser');
        setSelectedTool('eraser');
        return;
      }

      // Удаление
      if (code === 'Delete' || code === 'Backspace') {
        const selectedShapes = editor.getSelectedShapes();
        if (selectedShapes.length > 0) {
          editor.deleteShapes(selectedShapes);
        } else if (selectedElementId) {
          try {
            editor.deleteShapes([selectedElementId as TLShapeId]);
          } catch (error) {
            console.warn('Could not delete shape:', error);
          }
        }
        selectElement(null);
        return;
      }

      // Выбор всех
      if (code === 'KeyA' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        if (editor.menus.hasAnyOpenMenus()) return;
        editor.selectAll();
        return;
      }

      // Отмена выбора
      if (code === 'Escape') {
        editor.selectNone();
        selectElement(null);
        return;
      }

      // Масштабирование
      if (code === 'Equal' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.zoomIn();
        return;
      }

      if (code === 'Minus' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.zoomOut();
        return;
      }

      if (code === 'Digit0' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.resetZoom();
        return;
      }

      if (code === 'Digit1' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        editor.zoomToFit();
        return;
      }

      // Дублирование
      if (code === 'KeyD' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        const selectedShapes = editor.getSelectedShapes();
        if (selectedShapes.length > 0) {
          editor.duplicateShapes(selectedShapes);
        }
        return;
      }

      // Группировка / разгруппировка
      if (code === 'KeyG' && modKey && !altKey) {
        event.preventDefault();
        if (editor.menus.hasAnyOpenMenus()) return;

        const selectedShapes = editor.getSelectedShapes();
        if (selectedShapes.length === 0) return;

        const ids = selectedShapes.map((s) => s.id as TLShapeId);

        if (shiftKey) {
          const hasGroup = selectedShapes.some((shape) => shape.type === 'group');
          if (hasGroup) {
            event.preventDefault();
            try {
              editor.ungroupShapes(ids);
            } catch (err) {
              console.warn('Could not ungroup shapes:', err);
            }
          }
          return;
        }

        if (selectedShapes.length > 1) {
          event.preventDefault();
          try {
            editor.groupShapes(ids);
          } catch (err) {
            console.warn('Could not group shapes:', err);
          }
        }
        return;
      }

      // Справка по горячим клавишам
      if (code === 'F1') {
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
