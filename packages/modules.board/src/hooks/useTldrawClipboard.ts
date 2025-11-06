/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import * as lz from 'lz-string';
import { Editor, TLContent } from 'tldraw';
import { insertImage } from '../features/pickAndInsertImage';

export function useTldrawClipboard(editor: Editor | null, token?: string) {
  useEffect(() => {
    if (!editor) return;

    const doCopy = async () => {
      const ids = editor.getSelectedShapeIds();
      if (!ids || ids.length === 0) {
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText('');
          }
        } catch {
          console.error('Failed to copy');
        }
        return;
      }

      const content = await editor.resolveAssetsInContent(
        (editor.getContentFromCurrentPage as any)(ids),
      );

      if (!content) {
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText('');
          }
        } catch {
          console.error('Failed to copy');
        }
        return;
      }

      const { assets, ...otherData } = content as any;

      const clipboardData = {
        type: 'application/tldraw',
        kind: 'content',
        version: 3,
        data: {
          assets: assets || [],
          otherCompressed: lz.compressToBase64(JSON.stringify(otherData)),
        },
      };

      const stringified = JSON.stringify(clipboardData);

      try {
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

        const htmlBlob = new Blob([`<div data-tldraw>${stringified}</div>`], {
          type: 'text/html',
        });

        const plainText = textItems === '' ? ' ' : textItems;

        if (navigator.clipboard?.write) {
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/html': htmlBlob,
              'text/plain': new Blob([plainText], { type: 'text/plain' }),
            }),
          ]);
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(`<div data-tldraw>${stringified}</div>`);
        }
      } catch {
        try {
          await navigator.clipboard.writeText(`<div data-tldraw>${stringified}</div>`);
        } catch {
          console.error('Failed to copy');
        }
      }
    };

    const doPaste = async () => {
      let content: TLContent | null = null;

      try {
        let htmlText = '';

        if (navigator.clipboard?.read) {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            if (item.types.includes('text/html')) {
              const blob = await item.getType('text/html');
              htmlText = await blob.text();
              break;
            }
          }
        }

        if (!htmlText && navigator.clipboard?.readText) {
          htmlText = await navigator.clipboard.readText();
        }

        if (htmlText) {
          let match = htmlText.match(/<div data-tldraw[^>]*>(.*?)<\/div>/s);

          if (!match) {
            match = htmlText.match(/data-tldraw[^>]*>([^<]*(?:<(?!\/div>)[^<]*)*)/s);
          }

          if (!match) {
            const jsonMatch = htmlText.match(/\{"type":"application\/tldraw".*?\}/s);
            if (jsonMatch) {
              match = [htmlText, jsonMatch[0]];
            }
          }

          if (match && match[1]) {
            try {
              const parsed = JSON.parse(match[1]);
              const other = JSON.parse(lz.decompressFromBase64(parsed.data.otherCompressed));
              content = {
                ...other,
                assets: parsed.data.assets || [],
              };
            } catch {
              console.error('Failed to paste');
            }
          }
        }
      } catch {
        console.error('Failed to paste');
      }

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
    };

    const doCut = async () => {
      const ids = editor.getSelectedShapeIds();
      if (!ids || ids.length === 0) return;

      await doCopy();
      editor.deleteShapes(ids);
    };

    const handleKeyDown = async (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const isModKey = event.metaKey || event.ctrlKey;
      if (!isModKey) return;

      const key = event.code;

      if (key === 'KeyC') {
        event.preventDefault();
        await doCopy();
        if (!editor.getIsFocused()) editor.focus();
      } else if (key === 'KeyX') {
        event.preventDefault();
        if (!editor.getIsFocused()) editor.focus();
        await doCut();
      }
    };

    const handlePaste = async (event: ClipboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const clipboardData = event.clipboardData;

      if (!clipboardData) {
        return;
      }

      const items = Array.from(clipboardData.items);
      const imageItems = items.filter((item) => item.type.startsWith('image/'));

      const imageFiles: File[] = [];
      for (const item of imageItems) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0 && insertImage && token) {
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
      await doPaste();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [editor, token]);
}
