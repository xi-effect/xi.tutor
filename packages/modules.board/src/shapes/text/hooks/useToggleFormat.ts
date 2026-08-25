import { useCallback } from 'react';
import { TiptapEditor } from '@ibodr/draw';
import { ChainedCommandsFallbackT, MarkFormatT } from '../types';

export const useToggleFormat = (textEditor: TiptapEditor | null) => {
  const toggleFormatHandler = useCallback(
    (format: MarkFormatT, link?: string) => {
      if (!textEditor) return;

      const chain = textEditor.chain().focus() as ChainedCommandsFallbackT;

      switch (format) {
        case 'bold':
          chain.toggleBold?.().run();
          break;
        case 'italic':
          chain.toggleItalic?.().run();
          break;
        case 'strike':
          chain.toggleStrike?.().run();
          break;
        case 'underline':
          chain.toggleUnderline?.().run();
          break;
        case 'highlight':
          chain.toggleHighlight?.().run();
          break;
        case 'link': {
          if (link) {
            (textEditor.chain().extendMarkRange('link') as ChainedCommandsFallbackT)
              .setLink?.({ href: link })
              .run();
          } else {
            (textEditor.chain().extendMarkRange('link') as ChainedCommandsFallbackT)
              .unsetLink?.()
              .run();
          }
          break;
        }

        case 'bulletList':
          chain.toggleBulletList?.().run();
          break;
        default:
          break;
      }
    },
    [textEditor],
  );

  return { toggleFormatHandler };
};
