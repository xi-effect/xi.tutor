import { describe, expect, it } from 'vitest';
import { DEMO_CABINET_TEMPLATE_VERSION } from 'common.services';
import { demoBoardNeedsContent } from '../seedDemoBoard';

describe('demoBoardNeedsContent', () => {
  it('заполняет доску без версии и пустую доску текущей версии', () => {
    expect(demoBoardNeedsContent(undefined, 0)).toBe(true);
    expect(demoBoardNeedsContent(String(DEMO_CABINET_TEMPLATE_VERSION), 0)).toBe(true);
    expect(demoBoardNeedsContent(String(DEMO_CABINET_TEMPLATE_VERSION), 4)).toBe(true);
  });

  it('не перезаписывает доску, на которой уже есть шаблон', () => {
    expect(demoBoardNeedsContent(String(DEMO_CABINET_TEMPLATE_VERSION), 5)).toBe(false);
    expect(demoBoardNeedsContent(String(DEMO_CABINET_TEMPLATE_VERSION - 1), 40)).toBe(true);
  });
});
