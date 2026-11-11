import { describe, expect, it } from 'vitest';
import { createImageCrashGuard } from '../imageCrashGuard';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

describe('createImageCrashGuard', () => {
  it('чистый запуск: подозрительных нет', () => {
    const guard = createImageCrashGuard(memoryStorage(), memoryStorage());
    guard.markActive('a');
    expect(guard.isSuspect('a')).toBe(false);
  });

  it('после «смерти» (список активных остался) эти картинки подозрительны', () => {
    const session = memoryStorage();
    const local = memoryStorage();
    const first = createImageCrashGuard(session, local);
    first.markActive('a');
    first.markActive('b');
    // вкладка убита: pause() не вызывали

    const second = createImageCrashGuard(session, local);
    expect(second.isSuspect('a')).toBe(true);
    expect(second.isSuspect('b')).toBe(true);
    expect(second.isSuspect('c')).toBe(false);
  });

  it('штатный уход (pause) сбоем не считается', () => {
    const session = memoryStorage();
    const local = memoryStorage();
    const first = createImageCrashGuard(session, local);
    first.markActive('a');
    first.pause();

    expect(createImageCrashGuard(session, local).isSuspect('a')).toBe(false);
  });

  it('после resume список снова пишется', () => {
    const session = memoryStorage();
    const local = memoryStorage();
    const first = createImageCrashGuard(session, local);
    first.markActive('a');
    first.pause();
    first.resume();

    expect(createImageCrashGuard(session, local).isSuspect('a')).toBe(true);
  });

  it('картинка, убранная с экрана, не попадает в подозреваемые', () => {
    const session = memoryStorage();
    const local = memoryStorage();
    const first = createImageCrashGuard(session, local);
    first.markActive('a');
    first.markActive('b');
    first.markInactive('a');

    const second = createImageCrashGuard(session, local);
    expect(second.isSuspect('a')).toBe(false);
    expect(second.isSuspect('b')).toBe(true);
  });

  it('clearSuspect снимает пометку, сохраняет её и оповещает подписчиков', () => {
    const session = memoryStorage();
    const local = memoryStorage();
    createImageCrashGuard(session, local).markActive('a');

    const guard = createImageCrashGuard(session, local);
    let calls = 0;
    guard.subscribe(() => (calls += 1));
    const before = guard.getVersion();
    guard.clearSuspect('a');

    expect(guard.isSuspect('a')).toBe(false);
    expect(guard.getVersion()).toBeGreaterThan(before);
    expect(calls).toBe(1);
    expect(createImageCrashGuard(session, local).isSuspect('a')).toBe(false);
  });

  it('подозреваемые переживают перезагрузку, пока их не откроют сами', () => {
    const session = memoryStorage();
    const local = memoryStorage();
    createImageCrashGuard(session, local).markActive('a');
    createImageCrashGuard(session, local); // первая перезагрузка после сбоя
    expect(createImageCrashGuard(session, local).isSuspect('a')).toBe(true);
  });

  it('битое хранилище не ломает защиту', () => {
    const broken = {
      getItem: () => '{not json',
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {},
    };
    const guard = createImageCrashGuard(broken, broken);
    expect(() => guard.markActive('a')).not.toThrow();
    expect(guard.isSuspect('a')).toBe(false);
  });
});
