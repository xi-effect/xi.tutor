import { afterEach, describe, expect, it, vi } from 'vitest';
import { installNativeMediaAdapters, resetMediaAdaptersInstalled } from '../media';

function fakeStream(kinds: Array<'audio' | 'video'>): MediaStream {
  return {
    getVideoTracks: () => (kinds.includes('video') ? [{} as MediaStreamTrack] : []),
    getAudioTracks: () => (kinds.includes('audio') ? [{} as MediaStreamTrack] : []),
  } as MediaStream;
}

describe('installNativeMediaAdapters permissions shim', () => {
  afterEach(() => {
    resetMediaAdaptersInstalled();
    vi.unstubAllGlobals();
  });

  it('подменяет permissions.query denied на granted по статусу ОС', async () => {
    const chromiumQuery = vi.fn(async () => ({ state: 'denied' }));
    vi.stubGlobal('window', {
      __SOVLIUM_ELECTRON__: true,
      sovliumDesktop: {
        permissions: {
          status: vi.fn(async () => 'granted'),
          request: vi.fn(async () => 'granted'),
        },
      },
    });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Electron/38.0.0',
      permissions: { query: chromiumQuery },
      mediaDevices: {
        getUserMedia: vi.fn(async () => fakeStream(['audio', 'video'])),
        dispatchEvent: vi.fn(),
      },
    });

    installNativeMediaAdapters();

    const camera = await navigator.permissions.query({ name: 'camera' } as PermissionDescriptor);
    const microphone = await navigator.permissions.query({
      name: 'microphone',
    } as PermissionDescriptor);

    expect(camera.state).toBe('granted');
    expect(microphone.state).toBe('granted');
    expect(chromiumQuery).not.toHaveBeenCalled();
  });

  it('в Electron не считает prompt блокировкой селектов устройств', async () => {
    vi.stubGlobal('window', {
      __SOVLIUM_ELECTRON__: true,
      sovliumDesktop: {
        permissions: {
          status: vi.fn(async () => 'prompt'),
          request: vi.fn(async () => 'prompt'),
        },
      },
    });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Electron/38.0.0',
      permissions: {
        query: vi.fn(async () => ({ state: 'prompt' })),
      },
      mediaDevices: {
        getUserMedia: vi.fn(async () => fakeStream(['video'])),
        dispatchEvent: vi.fn(),
      },
    });

    installNativeMediaAdapters();

    const camera = await navigator.permissions.query({ name: 'camera' } as PermissionDescriptor);
    expect(camera.state).toBe('granted');
  });

  it('в Electron один раз вызывает getUserMedia, если enumerateDevices без deviceId', async () => {
    const empty = { deviceId: '', kind: 'audioinput', label: '', groupId: '' } as MediaDeviceInfo;
    const labeled = {
      deviceId: 'mic-1',
      kind: 'audioinput',
      label: 'Mic',
      groupId: 'g',
    } as MediaDeviceInfo;
    const stop = vi.fn();
    const tracks = [{ stop } as unknown as MediaStreamTrack];
    const gum = vi.fn(async () => ({
      getTracks: () => tracks,
      getVideoTracks: () => tracks,
      getAudioTracks: () => tracks,
    }));
    let enumerateCalls = 0;
    const enumerate = vi.fn(async () => {
      enumerateCalls += 1;
      return enumerateCalls === 1 ? [empty] : [labeled];
    });

    vi.stubGlobal('window', {
      __SOVLIUM_ELECTRON__: true,
      sovliumDesktop: {
        permissions: {
          status: vi.fn(async () => 'granted'),
          request: vi.fn(async () => 'granted'),
        },
      },
    });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Electron/38.0.0',
      permissions: { query: vi.fn(async () => ({ state: 'granted' })) },
      mediaDevices: {
        getUserMedia: gum,
        enumerateDevices: enumerate,
        dispatchEvent: vi.fn(),
      },
    });

    installNativeMediaAdapters();

    const first = await navigator.mediaDevices.enumerateDevices();
    const second = await navigator.mediaDevices.enumerateDevices();

    expect(gum).toHaveBeenCalledTimes(1);
    expect(first).toEqual([labeled]);
    expect(second).toEqual([labeled]);
    expect(stop).toHaveBeenCalled();
  });
});
