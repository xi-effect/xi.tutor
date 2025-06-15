import { useCallback, useRef } from 'react';
import Konva from 'konva';
import { BoardElement } from '../../../types';

export const useEditableTextarea = () => {
  const textRef = useRef<Konva.Text>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const cleanupRef = useRef<() => void>(() => {});

  const startEditing = useCallback(
    (
      element: BoardElement,
      onCommit: (text: string, width: number, height: number) => void,
      onCancel: () => void,
    ) => {
      if (!textRef.current) return;

      const textNode = textRef.current;
      const stage = textNode.getStage();
      const container = stage?.container();
      const boundingBox = container?.getBoundingClientRect();
      if (!container || !boundingBox) return;

      const rect = textNode.getClientRect();
      const scaleX = (stage?.scaleX() ?? 1) * (element.scaleX ?? 1);
      const scaleY = (stage?.scaleY() ?? 1) * (element.scaleY ?? 1);

      const areaPosition = {
        x: rect.x + boundingBox.left,
        y: rect.y + boundingBox.top,
      };

      const textarea = document.createElement('textarea');
      textareaRef.current = textarea;
      textarea.setAttribute('rows', '1');

      Object.assign(textarea.style, {
        position: 'absolute',
        top: `${areaPosition.y}px`,
        left: `${areaPosition.x}px`,
        padding: '0px',
        margin: '0px',
        overflow: 'hidden',
        background: 'transparent',
        outline: 'none',
        border: 'none',
        resize: 'none',
        color: element.fill || 'black',
        textAlign: 'left',
        fontFamily: element.fontFamily || 'Arial',
        fontSize: `${element.fontSize}px`,
        lineHeight: '1',
        zIndex: '1000',
        whiteSpace: 'pre-wrap',
        transform: `scale(${scaleX}, ${scaleY})`,
        transformOrigin: 'top left',
      });

      textarea.value = element.text || '';
      textarea.placeholder = 'Введите текст здесь';
      textarea.id = `textarea-${element.id}`;

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const updateTextArea = () => {
        textarea.style.width = 'auto';
        textarea.style.height = 'auto';

        const newWidth = textarea.scrollWidth;
        const newHeight = textarea.scrollHeight;

        textarea.style.width = `${newWidth}px`;
        textarea.style.height = `${newHeight}px`;
      };

      updateTextArea();
      textarea.addEventListener('input', updateTextArea);

      const applyChanges = () => {
        const value = textarea.value.trim();
        onCommit(value, textarea.scrollWidth, textarea.scrollHeight);
        cleanup();
      };

      const cancel = () => {
        cleanup();
        onCancel();
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          applyChanges();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancel();
        }
      };

      const handleClickOutside = (e: MouseEvent) => {
        if (!textarea.contains(e.target as Node)) {
          textarea.blur();
        }
      };

      const handleBlur = () => {
        applyChanges();
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      textarea.addEventListener('blur', handleBlur);

      const cleanup = () => {
        textarea.removeEventListener('input', updateTextArea);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleClickOutside);
        textarea.removeEventListener('blur', handleBlur);
        if (document.body.contains(textarea)) {
          document.body.removeChild(textarea);
        }
      };

      cleanupRef.current = cleanup;
    },
    [],
  );

  const stopEditing = useCallback(() => {
    cleanupRef.current?.();
  }, []);

  return {
    textRef,
    startEditing,
    stopEditing,
  };
};
