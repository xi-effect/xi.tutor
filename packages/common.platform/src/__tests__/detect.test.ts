import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getNativeOs,
  getRuntimeKind,
  isDesktopNative,
  isMobileNative,
  isNativeShell,
} from '../detect';

describe('detect', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('без window считает среду web', () => {
    expect(isNativeShell()).toBe(false);
    expect(isDesktopNative()).toBe(false);
    expect(isMobileNative()).toBe(false);
    expect(getRuntimeKind()).toBe('web');
    expect(getNativeOs()).toBe('unknown');
  });

  it('распознаёт desktop-shell по __SOVLIUM_NATIVE__', () => {
    vi.stubGlobal('window', { __SOVLIUM_NATIVE__: true });
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' });

    expect(isNativeShell()).toBe(true);
    expect(isDesktopNative()).toBe(true);
    expect(getRuntimeKind()).toBe('desktop');
    expect(getNativeOs()).toBe('macos');
  });

  it('распознаёт Windows desktop', () => {
    vi.stubGlobal('window', { __TAURI_INTERNALS__: {} });
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });

    expect(isDesktopNative()).toBe(true);
    expect(getNativeOs()).toBe('windows');
  });

  it('распознаёт mobile-shell по UA', () => {
    vi.stubGlobal('window', { __SOVLIUM_NATIVE__: true });
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' });

    expect(isMobileNative()).toBe(true);
    expect(isDesktopNative()).toBe(false);
    expect(getRuntimeKind()).toBe('mobile');
    expect(getNativeOs()).toBe('ios');
  });
});
