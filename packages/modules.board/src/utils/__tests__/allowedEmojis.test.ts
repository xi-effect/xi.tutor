import { describe, expect, it } from 'vitest';
import { filterAllowedEmojis, isAllowedEmoji } from '../allowedEmojis';
import catalog from '../emojiCatalog.json';

describe('allowedEmojis', () => {
  it('разрешает символы из каталога @xipkg/emojipicker', () => {
    expect(isAllowedEmoji('😀')).toBe(true);
    expect(catalog.chars.includes('😀')).toBe(true);
    expect(catalog.iconIds).toHaveLength(catalog.chars.length);
  });

  it('не рендерит символы вне каталога пакета', () => {
    expect(isAllowedEmoji('🍺')).toBe(false);
    expect(isAllowedEmoji('🍻')).toBe(false);
    expect(isAllowedEmoji('🔫')).toBe(false);
    expect(isAllowedEmoji('💣')).toBe(false);
    expect(isAllowedEmoji('🏳️‍🌈')).toBe(false);
    expect(isAllowedEmoji('🏳️‍⚧️')).toBe(false);
    expect(isAllowedEmoji('')).toBe(false);
  });

  it('фильтрует недавние эмодзи по каталогу пакета', () => {
    expect(filterAllowedEmojis(['😀', '🍺', '🎉', '🏳️‍🌈'])).toEqual(['😀', '🎉']);
  });
});
