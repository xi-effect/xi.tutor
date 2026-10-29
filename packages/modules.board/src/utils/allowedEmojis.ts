import { getEmojiIconId } from '@xipkg/emojipicker';
import catalog from './emojiCatalog.json';

const allowedIconIds = new Set(catalog.iconIds);
const allowedChars = new Set(catalog.chars);

/** Каталог пикера @xipkg/emojipicker; обновляется через `pnpm --filter modules.board sync-emoji-catalog`. */
export const isAllowedEmoji = (char: string): boolean => {
  if (!char) return false;
  if (allowedChars.has(char)) return true;

  return allowedIconIds.has(getEmojiIconId(char));
};

export const filterAllowedEmojis = (emojis: string[]): string[] => emojis.filter(isAllowedEmoji);
