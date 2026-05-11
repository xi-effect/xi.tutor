/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { Editor, react, TLAssetId } from 'tldraw';
import { insertImage } from '../features/pickAndInsertImage';
import {
  deserializeTldrawContent,
  extractClipboardImages,
  readClipboardHtml,
  serializeTldrawContent,
} from '../utils';
import {
  preparePastedContent,
  uploadPastedAssetsInBackground,
} from '../utils/reuploadPastedAssets';
import { getCachedDataUrl, resolveAssetAsDataUrl } from '../utils/resolveAssetUrl';

/** Лимит размера картинки (в байтах) для встраивания в clipboard как data:URL.
 *  Сверх него остаётся fallback на sourceToken — слишком большой clipboard
 *  всё равно обрезается браузерами / падает сериализация. */
const MAX_INLINED_ASSET_BYTES = 2 * 1024 * 1024; // 2 MiB

function approxBase64Size(dataUrl: string): number {
  // header + payload; payload ≈ 3/4 от base64-длины
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx < 0) return dataUrl.length;
  return Math.floor(((dataUrl.length - commaIdx - 1) * 3) / 4);
}

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
  // Prefetch: подписываемся на выделение и заранее качаем data:URL для
  // выделенных image-assets. К моменту нажатия Ctrl+C у нас в кэше уже
  // готовый data:URL, и paste картинок будет работать независимо от того,
  // жив ли storage_token к моменту вставки.
  //
  // PDF/audio сюда не включаем: их размер (до 5 MiB raw) после base64
  // делает clipboard слишком большим — Chrome обрезает text/html, и
  // вместе с PDF теряются и соседние картинки. Эти типы продолжают
  // работать через sourceToken + in-memory blobUrlCache в reuploadSrc.
  useEffect(() => {
    if (!editor || !token) return;

    const inFlight = new Set<string>();

    const startPrefetch = (src: string, fileSize?: unknown) => {
      if (!src) return;
      if (src.startsWith('data:') || src.startsWith('blob:')) return;
      if (getCachedDataUrl(src)) return;
      if (inFlight.has(src)) return;
      if (typeof fileSize === 'number' && fileSize > MAX_INLINED_ASSET_BYTES) return;

      inFlight.add(src);
      resolveAssetAsDataUrl(src, token)
        .catch(() => {
          /* prefetch — best effort */
        })
        .finally(() => {
          inFlight.delete(src);
        });
    };

    const stop = react('prefetch selected assets as data url', () => {
      const ids = editor.getSelectedShapeIds();
      if (ids.length === 0) return;

      const assetIds = new Set<TLAssetId>();
      for (const id of ids) {
        const shape = editor.getShape(id);
        if (!shape) continue;
        const props = shape.props as Record<string, unknown>;

        // Только image/video assets — для PDF/audio data:URL ломает clipboard
        // (см. handleCopy ниже), поэтому prefetch для них не нужен.
        if (typeof props.assetId === 'string') {
          assetIds.add(props.assetId as TLAssetId);
        }
      }

      for (const assetId of assetIds) {
        const asset = editor.getAsset(assetId);
        if (!asset) continue;
        const assetProps = asset.props as Record<string, unknown>;
        startPrefetch(
          typeof assetProps.src === 'string' ? assetProps.src : '',
          assetProps.fileSize,
        );
      }
    });

    return () => {
      stop();
    };
  }, [editor, token]);

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
        if (!src || src.startsWith('data:') || src.startsWith('blob:')) continue;

        // Если data:URL уже подготовлен prefetch'ем — встраиваем картинку прямо в clipboard.
        // Это снимает зависимость paste'а от storage_token, который может протухнуть.
        const dataUrl = getCachedDataUrl(src);
        if (dataUrl && approxBase64Size(dataUrl) <= MAX_INLINED_ASSET_BYTES) {
          asset.props.src = dataUrl;
          asset.meta = { ...asset.meta, originalSrc: src, sourceToken: token };
        } else {
          // Fallback: prefetch не успел / файл слишком большой / нет токена —
          // используем старую логику с sourceToken (paste сработает, если токен жив).
          asset.meta = { ...asset.meta, originalSrc: src, sourceToken: token };
        }
      }
      for (const shape of rawContent.shapes ?? []) {
        if (shape.type !== 'audio' && shape.type !== 'pdf') continue;
        const src = shape.props?.src;
        if (!src || src.startsWith('data:') || src.startsWith('blob:')) continue;

        // PDF/audio НЕ встраиваем как data:URL в clipboard — их размер (до 5 MiB raw
        // → ~6.7 MiB base64) ломает setData('text/html') в Chrome, и тогда вместе с
        // PDF из clipboard теряются и соседние картинки. Эти типы по-прежнему
        // работают через sourceToken + in-memory blobUrlCache (шаг 0 в reuploadSrc).
        shape.meta = { ...shape.meta, originalSrc: src, sourceToken: token };
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

      // 1) Синхронная подготовка: same-board restore + сбор задач на upload.
      //    Тяжёлые ввод/вывод-операции сюда не лезут.
      const uploadTasks = token ? preparePastedContent(content, editor!, token) : [];

      // 2) Мгновенная вставка: shape'ы появляются на доске сразу.
      //    preserveIds:true нужно, чтобы потом по сохранённым id обновлять
      //    src через editor.updateAssets/updateShape по мере готовности upload'а.
      try {
        const point = editor!.inputs.currentPagePoint;
        await editor!.putContentOntoCurrentPage(content, {
          point: { x: point.x + 20, y: point.y + 20 },
          select: true,
          preserveIds: true,
        });
      } catch (err) {
        console.error('Failed to paste content:', err);
        return;
      }

      // 3) Фоновая докачка и re-upload (fire-and-forget). По готовности каждого
      //    upload'а зовётся editor.updateAssets/updateShape — картинки заменяются
      //    с preview src (data:URL / blob из cache / originalSrc) на серверный URL
      //    индивидуально, без ожидания общего батча.
      if (token && uploadTasks.length > 0) {
        uploadPastedAssetsInBackground(uploadTasks, editor!, token);
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
