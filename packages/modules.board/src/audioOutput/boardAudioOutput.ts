import { useSyncExternalStore } from 'react';

type AudioOutputDeviceGetter = () => string | undefined;

let getDeviceId: AudioOutputDeviceGetter = () => undefined;
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

/** ВКС регистрирует источник выбранных динамиков, доска не зависит от calls-store. */
export function registerBoardAudioOutputDevice(getter: AudioOutputDeviceGetter): () => void {
  getDeviceId = getter;
  emit();
  return () => {
    if (getDeviceId === getter) {
      getDeviceId = () => undefined;
      emit();
    }
  };
}

export function getBoardAudioOutputDeviceId(): string | undefined {
  return getDeviceId();
}

export function subscribeBoardAudioOutputDevice(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyBoardAudioOutputDeviceChanged(): void {
  emit();
}

export function useBoardAudioOutputDeviceId(): string | undefined {
  return useSyncExternalStore(
    subscribeBoardAudioOutputDevice,
    getBoardAudioOutputDeviceId,
    () => undefined,
  );
}
