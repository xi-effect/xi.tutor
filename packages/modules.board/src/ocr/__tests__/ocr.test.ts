import { describe, expect, it } from 'vitest';
import { getPaddleLangCode, getPaddleModelGroup } from '../languageMap';
import { getOcrTextPagePoint, getOcrTextWidth } from '../ocrTextPlacement';
import {
  inferOcrLanguageFromSubject,
  inferOcrLanguageFromUiLocale,
  resolveOcrLanguage,
} from '../resolveOcrLanguage';
import { textFromOcrItems } from '../textFromOcrItems';

describe('getPaddleModelGroup', () => {
  it('кладёт латиницу, английский, японский и китайский в одну multilingual-модель', () => {
    expect(getPaddleModelGroup('en')).toBe('multilingual');
    expect(getPaddleModelGroup('de')).toBe('multilingual');
    expect(getPaddleModelGroup('fr')).toBe('multilingual');
    expect(getPaddleModelGroup('es')).toBe('multilingual');
    expect(getPaddleModelGroup('it')).toBe('multilingual');
    expect(getPaddleModelGroup('ja')).toBe('multilingual');
    expect(getPaddleModelGroup('zh')).toBe('multilingual');
  });

  it('выделяет русский в отдельную cyrillic-модель', () => {
    expect(getPaddleModelGroup('ru')).toBe('cyrillic');
  });
});

describe('getPaddleLangCode', () => {
  it('мапит коды Sovlium на коды PaddleOCR', () => {
    expect(getPaddleLangCode('ru')).toBe('cyrillic');
    expect(getPaddleLangCode('ja')).toBe('japan');
    expect(getPaddleLangCode('zh')).toBe('ch');
    expect(getPaddleLangCode('en')).toBe('en');
    expect(getPaddleLangCode('de')).toBe('de');
  });
});

describe('resolveOcrLanguage', () => {
  it('для явного языка не ходит в Auto', () => {
    expect(
      resolveOcrLanguage({
        selection: 'ja',
        lastResolvedLanguage: 'en',
        contextualLanguage: 'ru',
      }),
    ).toBe('ja');
  });

  it('для Auto берёт последний язык, не перебирая модели', () => {
    expect(
      resolveOcrLanguage({
        selection: 'auto',
        lastResolvedLanguage: 'fr',
        contextualLanguage: 'en',
      }),
    ).toBe('fr');
  });

  it('для Auto без истории берёт язык из контекста', () => {
    expect(
      resolveOcrLanguage({
        selection: 'auto',
        lastResolvedLanguage: null,
        contextualLanguage: 'de',
      }),
    ).toBe('de');
  });
});

describe('inferOcrLanguageFromSubject', () => {
  it('определяет язык по названию предмета', () => {
    expect(inferOcrLanguageFromSubject('Английский язык')).toBe('en');
    expect(inferOcrLanguageFromSubject('Deutsch')).toBe('de');
    expect(inferOcrLanguageFromSubject('日本語')).toBe('ja');
    expect(inferOcrLanguageFromSubject('Математика')).toBeNull();
  });
});

describe('inferOcrLanguageFromUiLocale', () => {
  it('берёт поддерживаемый язык из locale UI', () => {
    expect(inferOcrLanguageFromUiLocale('ru-RU')).toBe('ru');
    expect(inferOcrLanguageFromUiLocale('en')).toBe('en');
    expect(inferOcrLanguageFromUiLocale('pt-BR')).toBeNull();
  });
});

describe('textFromOcrItems', () => {
  it('склеивает строки сверху вниз и считает среднюю уверенность', () => {
    const result = textFromOcrItems([
      { text: 'world', score: 0.8, poly: [{ x: 10, y: 40 }] },
      { text: 'hello', score: 1, poly: [{ x: 2, y: 4 }] },
    ]);
    expect(result.text).toBe('hello\nworld');
    expect(result.confidence).toBeCloseTo(0.9);
  });

  it('возвращает пустую строку, если текста нет', () => {
    expect(textFromOcrItems([]).text).toBe('');
    expect(textFromOcrItems([{ text: '   ', score: 0.9 }]).text).toBe('');
  });
});

describe('ocrTextPlacement', () => {
  it('ставит текст справа от изображения с отступом', () => {
    expect(getOcrTextPagePoint({ maxX: 100, minY: 20 }, 16)).toEqual({ x: 116, y: 20 });
    expect(getOcrTextWidth(800)).toBe(480);
    expect(getOcrTextWidth(120)).toBe(200);
  });
});
