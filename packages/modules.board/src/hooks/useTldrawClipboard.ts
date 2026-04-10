/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { Editor } from 'tldraw';
import { insertImage } from '../features/pickAndInsertImage';
import {
  deserializeTldrawContent,
  extractClipboardImages,
  readClipboardHtml,
  serializeTldrawContent,
} from '../utils';
import { reuploadPastedAssets } from '../utils/reuploadPastedAssets';

/**
 * Overrides tldraw's built-in clipboard handling with a custom implementation
 * that uses the system clipboard (not tldraw's internal one).
 *
 * Cross-board / cross-tab paste:
 * - Every board registers its x-storage-token in localStorage (token registry).
 * - On paste, reuploadPastedAssets tries all known tokens to download files
 *   from any previously visited board, then re-uploads them to the current one.
 * - myAssetStore.resolve also has the same fallback for immediate display.
 */
export function useTldrawClipboard(editor: Editor | null, token?: string) {
  useEffect(() => {
    if (!editor) return;

    function isExternalInput(target: HTMLElement): boolean {
      if (target.isContentEditable) return true;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        return !editor!.getContainer().contains(target);
      }
      return false;
    }

    function getTextFromShapes(shapes: any[]): string {
      return (shapes ?? [])
        .map((shape: any) => {
          try {
            return editor!.getShapeUtil(shape)?.getText?.(shape);
          } catch {
            return undefined;
          }
        })
        .filter(Boolean)
        .join(' ');
    }

    // ── Copy ────────────────────────────────────────────────────────────
    function handleCopy(event: ClipboardEvent) {
      if (isExternalInput(event.target as HTMLElement)) return;

      event.stopPropagation();

      const ids = editor!.getSelectedShapeIds();
      if (!ids || ids.length === 0) return;

      const frozen = (editor!.getContentFromCurrentPage as any)(ids);
      if (!frozen) return;

      const rawContent = JSON.parse(JSON.stringify(frozen));

      for (const asset of rawContent.assets ?? []) {
        const src = asset.props?.src;
        if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
          asset.meta = { ...asset.meta, originalSrc: src, sourceToken: token };
        }
      }
      for (const shape of rawContent.shapes ?? []) {
        if (shape.type !== 'audio' && shape.type !== 'pdf') continue;
        const src = shape.props?.src;
        if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
          shape.meta = { ...shape.meta, originalSrc: src, sourceToken: token };
        }
      }

      const serialized = serializeTldrawContent(rawContent);
      const text = getTextFromShapes(frozen.shapes) || ' ';

      event.preventDefault();
      event.clipboardData?.setData('text/html', serialized);
      event.clipboardData?.setData('text/plain', text);

      if (!editor!.getIsFocused()) editor!.focus();
    }

    // ── Cut ─────────────────────────────────────────────────────────────
    function handleCut(event: ClipboardEvent) {
      handleCopy(event);
      if (event.defaultPrevented) {
        editor!.deleteShapes(editor!.getSelectedShapeIds());
        if (!editor!.getIsFocused()) editor!.focus();
      }
    }

    // ── Paste ───────────────────────────────────────────────────────────
    async function handlePaste(event: ClipboardEvent) {
      if (isExternalInput(event.target as HTMLElement)) return;

      event.preventDefault();
      event.stopPropagation();

      const imageFiles = extractClipboardImages(event);
      if (imageFiles.length > 0 && token) {
        if (!editor!.getIsFocused()) editor!.focus();
        for (const file of imageFiles) {
          try {
            await insertImage(editor!, file, token);
          } catch (error) {
            console.error('Failed to paste image:', error);
          }
        }
        return;
      }

      if (!editor!.getIsFocused()) editor!.focus();

      let html = event.clipboardData?.getData('text/html') || '';
      if (!html) {
        html = await readClipboardHtml();
      }

      const content = deserializeTldrawContent(html);
      if (!content) return;

      if (token) {
        try {
          await reuploadPastedAssets(content, editor!, token);
        } catch (err) {
          console.warn('[paste] Asset re-upload failed, pasting with original srcs:', err);
        }
      }

      try {
        const point = editor!.inputs.currentPagePoint;
        await editor!.putContentOntoCurrentPage(content, {
          point: { x: point.x + 20, y: point.y + 20 },
          select: true,
        });
      } catch (err) {
        console.error('Failed to paste content:', err);
      }
    }

    // ── Keydown (only blocks tldraw, lets browser fire native events) ──
    function handleKeyDown(event: KeyboardEvent) {
      if (isExternalInput(event.target as HTMLElement)) return;
      const isModKey = event.metaKey || event.ctrlKey;
      if (!isModKey) return;

      const key = event.code;
      if (key === 'KeyC' || key === 'KeyX' || key === 'KeyV') {
        event.stopPropagation();
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('copy', handleCopy, { capture: true });
    window.addEventListener('cut', handleCut, { capture: true });
    window.addEventListener('paste', handlePaste as unknown as EventListener, {
      capture: true,
      passive: false,
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('copy', handleCopy, { capture: true });
      window.removeEventListener('cut', handleCut, { capture: true });
      window.removeEventListener('paste', handlePaste as unknown as EventListener, {
        capture: true,
      });
    };
  }, [editor, token]);
}
