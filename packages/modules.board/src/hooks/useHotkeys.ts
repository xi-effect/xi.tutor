import { DrShapeId, useEditor } from '@ibodr/draw';
import { useEffect } from 'react';
import { useDrawStore } from '../store';
import { isEmptyLabelEditOnTypeContext, shouldIgnoreBoardHotkeys } from '../utils';
import { useYjsContext } from '../providers/YjsProvider';
import { useDrawStyles } from './useDrawStyles';

export const useHotkeys = () => {
  const editor = useEditor();
  const { selectedElementId, selectElement, setSelectedTool } = useDrawStore();
  const { isReadonly } = useYjsContext();
  const { resetToDefaults, setColor, setThickness, setOpacity, applyStoreStylesForShape } =
    useDrawStyles();

  useEffect(() => {
    if (!editor) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (!editor) return;
      if (shouldIgnoreBoardHotkeys(editor, event.target)) return;

      const deferToLabelEditOnType = isEmptyLabelEditOnTypeContext(editor);
      const { code, ctrlKey, shiftKey, metaKey, altKey } = event;
      const modKey = ctrlKey || metaKey;

      // Cmd/Ctrl+Z и Cmd/Ctrl+Shift+Z уже обрабатывает редактор, когда канвас в фокусе.
      // Повторный вызов здесь откатывал бы тот же жест второй раз.
      const editorHandlesHistory = editor.getInstanceState().isFocused;

      if (code === 'KeyZ' && modKey && !altKey) {
        if (editorHandlesHistory || isReadonly) return;
        event.preventDefault();
        if (shiftKey) {
          if (editor.canRedo()) editor.redo();
        } else if (editor.canUndo()) {
          editor.undo();
        }
        return;
      }

      // Cmd/Ctrl+Y добавлен в action redo. В фокусе его обрабатывает редактор.
      if (code === 'KeyY' && modKey && !shiftKey && !altKey) {
        if (editorHandlesHistory || isReadonly) return;
        event.preventDefault();
        if (editor.canRedo()) editor.redo();
        return;
      }

      // Основные инструменты
      if (code === 'KeyV' && !modKey && !shiftKey && !altKey) {
        if (deferToLabelEditOnType) return;
        event.preventDefault();
        resetToDefaults();
        editor.setCurrentTool('select');
        setSelectedTool('select');
        return;
      }

      if (code === 'KeyH' && !modKey && !shiftKey && !altKey) {
        if (deferToLabelEditOnType) return;
        event.preventDefault();
        resetToDefaults();
        editor.setCurrentTool('hand');
        setSelectedTool('hand');
        return;
      }

      if (code === 'KeyP' && !modKey && !shiftKey && !altKey) {
        if (deferToLabelEditOnType) return;
        event.preventDefault();
        const { pencilColor, pencilThickness, pencilOpacity } = useDrawStore.getState();
        applyStoreStylesForShape('pen');
        setColor(pencilColor);
        setThickness(pencilThickness);
        setOpacity(pencilOpacity);
        editor.setCurrentTool('draw');
        setSelectedTool('pen');
        return;
      }

      if (code === 'KeyT' && !modKey && !shiftKey && !altKey) {
        if (deferToLabelEditOnType) return;
        event.preventDefault();
        resetToDefaults();
        editor.setCurrentTool('text');
        setSelectedTool('text');
        return;
      }

      if (code === 'KeyG' && !modKey && !shiftKey && !altKey) {
        if (deferToLabelEditOnType) return;
        event.preventDefault();
        editor.setCurrentTool('xi-geo');
        setSelectedTool('xi-geo');
        applyStoreStylesForShape('xi-geo');

        return;
      }

      if (code === 'KeyA' && !modKey && !shiftKey && !altKey) {
        if (deferToLabelEditOnType) return;
        event.preventDefault();
        resetToDefaults();
        editor.setCurrentTool('arrow');
        setSelectedTool('arrow');
        return;
      }

      if (code === 'KeyE' && !modKey && !shiftKey && !altKey) {
        if (deferToLabelEditOnType) return;
        event.preventDefault();
        resetToDefaults();
        editor.setCurrentTool('eraser');
        setSelectedTool('eraser');
        return;
      }

      if (code === 'KeyF' && !modKey && !shiftKey && !altKey) {
        if (deferToLabelEditOnType) return;
        event.preventDefault();
        resetToDefaults();
        editor.setCurrentTool('frame');
        setSelectedTool('frame');
        return;
      }

      // Удаление
      if (code === 'Delete' || code === 'Backspace') {
        const selectedShapes = editor.getSelectedShapes();
        if (selectedShapes.length > 0) {
          editor.deleteShapes(selectedShapes);
        } else if (selectedElementId) {
          try {
            editor.deleteShapes([selectedElementId as DrShapeId]);
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

        const ids = selectedShapes.map((s) => s.id as DrShapeId);

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

      // Блокировка / разблокировка
      if (code === 'KeyL' && modKey && !shiftKey && !altKey) {
        event.preventDefault();
        const selectedIds = editor.getSelectedShapeIds();
        if (selectedIds.length > 0) {
          editor.toggleLock(selectedIds);
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
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    editor,
    selectedElementId,
    selectElement,
    setSelectedTool,
    isReadonly,
    resetToDefaults,
    setColor,
    setThickness,
    setOpacity,
    applyStoreStylesForShape,
  ]);
};
