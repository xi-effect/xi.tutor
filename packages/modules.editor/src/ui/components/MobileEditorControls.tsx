import { useEffect, useState } from 'react';
import { Editor } from '@tiptap/core';
import { NotesEditorToolbar } from './NotesEditorToolbar';
import { useKeyboardInset } from '../../hooks/useKeyboardInset';

type MobileEditorControlsPropsT = {
  editor: Editor;
};

/** Задержка скрытия панели после blur (мс). Тап по кнопке даёт временный blur → focus. */
const HIDE_DELAY = 250;

/**
 * Мобильные контролы редактора: пока редактор в фокусе — панель инструментов над клавиатурой.
 *
 * На blur не убираем панель мгновенно: тап по кнопке тулбара на мобильном Safari/Chrome
 * может кратко увести фокус (действие тут же делает `.chain().focus()`), и без задержки
 * панель размонтировалась бы посреди тапа — действие терялось бы.
 */
export const MobileEditorControls = ({ editor }: MobileEditorControlsPropsT) => {
  const [visible, setVisible] = useState(() => editor.isFocused);
  const keyboardInset = useKeyboardInset();

  useEffect(() => {
    let hideTimer = 0;

    const show = () => {
      clearTimeout(hideTimer);
      setVisible(true);
    };
    const scheduleHide = () => {
      clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setVisible(false), HIDE_DELAY);
    };

    editor.on('focus', show);
    editor.on('blur', scheduleHide);

    return () => {
      clearTimeout(hideTimer);
      editor.off('focus', show);
      editor.off('blur', scheduleHide);
    };
  }, [editor]);

  if (!visible) return null;

  return <NotesEditorToolbar editor={editor} bottom={keyboardInset} />;
};
