/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback } from 'react';
import { Editor } from 'tldraw';
import { insertImage } from '../features/pickAndInsertImage';
import {
  deserializeTldrawContent,
  extractClipboardImages,
  readClipboardHtml,
  serializeTldrawContent,
  writeClipboardHtmlAndText,
} from '../utils';

export function useTldrawClipboard(editor: Editor | null, token?: string) {
  const handleCopy = useCallback(async () => {
    if (!editor) return;

    const ids = editor.getSelectedShapeIds();
    if (!ids || ids.length === 0) {
      await navigator.clipboard?.writeText('');
      return;
    }

    const content = await editor.resolveAssetsInContent(
      (editor.getContentFromCurrentPage as any)(ids),
    );

    if (!content) {
      await navigator.clipboard?.writeText('');
      return;
    }

    const serialized = serializeTldrawContent(content);

    const textItems = (content.shapes ?? [])
      .map((shape: any) => {
        try {
          const util = editor.getShapeUtil(shape);
          return util?.getText?.(shape);
        } catch {
          return undefined;
        }
      })
      .filter(Boolean)
      .join(' ');

    await writeClipboardHtmlAndText(serialized, textItems || ' ');

    if (!editor.getIsFocused()) editor.focus();
  }, [editor]);

  const handleCut = useCallback(async () => {
    if (!editor) return;
    await handleCopy();
    editor.deleteShapes(editor.getSelectedShapeIds());
    if (!editor.getIsFocused()) editor.focus();
  }, [editor, handleCopy]);

  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      if (!editor) return;

      const target = event.target as HTMLElement;
      if (target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      const imageFiles = extractClipboardImages(event);
      if (imageFiles.length > 0 && token) {
        event.preventDefault();
        if (!editor.getIsFocused()) editor.focus();

        for (const file of imageFiles) {
          try {
            await insertImage(editor, file, token);
          } catch (error) {
            console.error('Failed to paste image:', error);
          }
        }
        return;
      }

      event.preventDefault();
      if (!editor.getIsFocused()) editor.focus();

      const html = await readClipboardHtml();
      const content = deserializeTldrawContent(html);
      if (!content) return;

      try {
        const point = editor.inputs.currentPagePoint;
        await editor.putContentOntoCurrentPage(content, {
          point: { x: point.x + 20, y: point.y + 20 },
          select: true,
        });
      } catch (err) {
        console.error('Failed to paste content:', err);
      }
    },
    [editor, token],
  );

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      const isModKey = event.metaKey || event.ctrlKey;
      if (!isModKey) return;

      const key = event.code;
      if (key === 'KeyC') {
        event.preventDefault();
        await handleCopy();
      } else if (key === 'KeyX') {
        event.preventDefault();
        await handleCut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [editor, handleCopy, handleCut, handlePaste]);
}
