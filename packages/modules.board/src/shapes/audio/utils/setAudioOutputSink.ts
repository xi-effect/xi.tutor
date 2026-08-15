type AudioWithSink = HTMLMediaElement & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

/** Нормализует id устройства вывода: пустое значение = системный default. */
export function resolveAudioOutputSinkId(deviceId?: string | null): string {
  if (!deviceId || deviceId === 'default') return 'default';
  return deviceId;
}

/**
 * Направляет HTMLAudio на то же устройство, что выбрано в ВКС.
 * Safari / Firefox без setSinkId — no-op.
 */
export function setAudioOutputSink(audio: HTMLMediaElement, deviceId?: string | null): void {
  const el = audio as AudioWithSink;
  if (typeof el.setSinkId !== 'function') return;

  void el.setSinkId(resolveAudioOutputSinkId(deviceId)).catch(() => undefined);
}
