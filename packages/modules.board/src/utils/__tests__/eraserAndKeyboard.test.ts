import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ERASER_CATEGORIES } from '../../config';
import {
  DEFAULT_ERASER_SETTINGS,
  migrateEraserSettings,
  useEraserSettingsStore,
} from '../../store/useEraserSettingsStore';
import { areAllEraserCategoriesEnabled } from '../areAllEraserCategoriesEnabled';
import { isShapeErasable } from '../isShapeErasable';
import { shouldIgnoreBoardHotkeys } from '../boardKeyboard';

function stubLocalStorage() {
  const mem = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
    removeItem: (key: string) => {
      mem.delete(key);
    },
    clear: () => mem.clear(),
    key: () => null,
    length: 0,
  });
}

describe('areAllEraserCategoriesEnabled', () => {
  it('true только если включены все категории', () => {
    const allOn = Object.fromEntries(ERASER_CATEGORIES.map(({ key }) => [key, true]));
    const oneOff = { ...allOn, text: false };

    expect(areAllEraserCategoriesEnabled(allOn)).toBe(true);
    expect(areAllEraserCategoriesEnabled(oneOff)).toBe(false);
  });
});

describe('isShapeErasable', () => {
  beforeEach(() => {
    stubLocalStorage();
    useEraserSettingsStore.setState({
      settings: Object.fromEntries(ERASER_CATEGORIES.map(({ key }) => [key, true])),
    });
  });

  it('разрешает неизвестный тип', () => {
    expect(isShapeErasable('custom-unknown')).toBe(true);
  });

  it('смотрит настройку категории', () => {
    expect(isShapeErasable('text')).toBe(true);
    useEraserSettingsStore.setState({
      settings: { ...useEraserSettingsStore.getState().settings, text: false },
    });
    expect(isShapeErasable('text')).toBe(false);
  });

  it('не стирает картинку и файл, пока категорию не включили', () => {
    useEraserSettingsStore.setState({ settings: { ...DEFAULT_ERASER_SETTINGS } });
    expect(isShapeErasable('draw')).toBe(true);
    expect(isShapeErasable('image')).toBe(false);
    expect(isShapeErasable('file')).toBe(false);
    expect(isShapeErasable('pdf')).toBe(false);
    expect(isShapeErasable('presentation')).toBe(false);

    useEraserSettingsStore.setState({
      settings: { ...DEFAULT_ERASER_SETTINGS, images: true, media: true },
    });
    expect(isShapeErasable('image')).toBe(true);
    expect(isShapeErasable('file')).toBe(true);
  });
});

describe('migrateEraserSettings', () => {
  it('выключает картинки и файлы у старого дефолта «стирать всё»', () => {
    const migrated = migrateEraserSettings(
      {
        settings: {
          text: true,
          images: true,
          files: true,
          shapes: true,
          stickers: true,
          frames: true,
          arrows: true,
          lines: true,
          activities: true,
        },
      },
      0,
    );

    expect(migrated.settings.images).toBe(false);
    expect(migrated.settings.media).toBe(false);
    expect(migrated.settings.text).toBe(true);
    expect(migrated.settings.files).toBeUndefined();
  });

  it('сохраняет явный выбор media', () => {
    const migrated = migrateEraserSettings(
      { settings: { ...DEFAULT_ERASER_SETTINGS, images: true, media: true } },
      1,
    );

    expect(migrated.settings.images).toBe(true);
    expect(migrated.settings.media).toBe(true);
  });
});

describe('shouldIgnoreBoardHotkeys', () => {
  beforeEach(() => {
    vi.stubGlobal('HTMLElement', class HTMLElement {});
  });

  it('игнорирует, если shape в режиме редактирования', () => {
    const editor = { getEditingShapeId: () => 'shape:1' };
    expect(shouldIgnoreBoardHotkeys(editor as never, null)).toBe(true);
  });

  it('не игнорирует обычный клик по канвасу', () => {
    const editor = { getEditingShapeId: () => null };
    expect(shouldIgnoreBoardHotkeys(editor as never, null)).toBe(false);
  });
});
