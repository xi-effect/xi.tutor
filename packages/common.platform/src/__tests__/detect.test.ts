import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getNativeOs,
  getRuntimeKind,
  isDesktopNative,
  isMobileNative,
  isNativeShell,
  isTabletNative,
} from '../detect';

describe('detect', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('без window считает среду web', () => {
    expect(isNativeShell()).toBe(false);
    expect(isDesktopNative()).toBe(false);
    expect(isMobileNative()).toBe(false);
    expect(isTabletNative()).toBe(false);
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
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    });

    expect(isMobileNative()).toBe(true);
    expect(isDesktopNative()).toBe(false);
    expect(isTabletNative()).toBe(false);
    expect(getRuntimeKind()).toBe('mobile');
    expect(getNativeOs()).toBe('ios');
  });

  it('предпочитает __SOVLIUM_NATIVE_OS__ вместо Macintosh UA', () => {
    vi.stubGlobal('window', { __SOVLIUM_NATIVE__: true, __SOVLIUM_NATIVE_OS__: 'ios' });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      maxTouchPoints: 5,
    });

    expect(isMobileNative()).toBe(true);
    expect(isTabletNative()).toBe(true);
    expect(getNativeOs()).toBe('ios');
    expect(getRuntimeKind()).toBe('mobile');
  });

  it('считает iPadOS с desktop-UA планшетом по maxTouchPoints', () => {
    vi.stubGlobal('window', { __SOVLIUM_NATIVE__: true });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      maxTouchPoints: 5,
    });

    expect(isMobileNative()).toBe(true);
    expect(isTabletNative()).toBe(true);
    expect(getNativeOs()).toBe('ios');
  });

  it('распознаёт Android-планшет (без Mobile в UA)', () => {
    vi.stubGlobal('window', { __SOVLIUM_NATIVE__: true, __SOVLIUM_NATIVE_OS__: 'android' });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-X810) AppleWebKit/537.36',
    });

    expect(isMobileNative()).toBe(true);
    expect(isTabletNative()).toBe(true);
    expect(getNativeOs()).toBe('android');
  });

  it('не считает Android-телефон планшетом', () => {
    vi.stubGlobal('window', { __SOVLIUM_NATIVE__: true, __SOVLIUM_NATIVE_OS__: 'android' });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36',
    });

    expect(isMobileNative()).toBe(true);
    expect(isTabletNative()).toBe(false);
  });
});
