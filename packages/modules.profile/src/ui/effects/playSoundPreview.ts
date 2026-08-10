import type { SoundKey } from 'common.ui';

const SOUND_FILES: Record<SoundKey, string> = {
  chatMessage: 'chat-message.wav',
  handRaise: 'hand-raise.wav',
  userJoin: 'user-join-to-call.mp3',
  userLeft: 'user-left-from-call.mp3',
  boardTimerEnd: 'board-timer-end.mp3',
  boardTimerWarn: 'board-timer-to-end.mp3',
};

const resolveSoundUrl = (file: string): string => {
  const base = import.meta.env.BASE_URL ?? '/';
  const path =
    base === '/' || base === ''
      ? `/sounds/${file}`
      : `${String(base).replace(/\/$/, '')}/sounds/${file}`;

  if (typeof window !== 'undefined') {
    try {
      return new URL(path, window.location.origin).href;
    } catch {
      return path;
    }
  }
  return path;
};

const audioCache = new Map<SoundKey, HTMLAudioElement>();

const getAudio = (soundKey: SoundKey): HTMLAudioElement => {
  let audio = audioCache.get(soundKey);
  if (!audio) {
    audio = new Audio(resolveSoundUrl(SOUND_FILES[soundKey]));
    audio.preload = 'auto';
    audioCache.set(soundKey, audio);
  }
  return audio;
};

/** Воспроизводит превью эффекта на заданной громкости (0–1). */
export const playSoundPreview = (soundKey: SoundKey, volume: number): void => {
  const audio = getAudio(soundKey);
  try {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = Math.max(0, Math.min(1, volume));
    void audio.play().catch(() => {});
  } catch {
    /* ignore */
  }
};
