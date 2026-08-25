import { useSoundEffectsStore, type SoundKey } from '../store/useSoundEffectsStore';

const SOUND_FILES: Record<SoundKey, string> = {
  chatMessage: 'chat-message.wav',
  handRaise: 'hand-raise.wav',
  userJoin: 'user-join-to-call.mp3',
  userLeft: 'user-left-from-call.mp3',
  boardTimerEnd: 'board-timer-end.mp3',
  boardTimerWarn: 'board-timer-to-end.mp3',
  notification: 'notification.mp3',
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

/** Воспроизводит эффект. Без override берёт громкость из store (0 — тишина). */
export const playSoundEffect = (soundKey: SoundKey, volumeOverride?: number): void => {
  const volume = volumeOverride ?? useSoundEffectsStore.getState().getEffectiveVolume(soundKey);
  if (volume <= 0) return;

  const audio = getAudio(soundKey);
  try {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = Math.max(0, Math.min(1, volume));
    void audio.play().catch(() => {});
  } catch {
    /* ignore: autoplay / отсутствующий файл */
  }
};

/** Разблокировка autoplay: одноразовый тихий play из user gesture. */
export const unlockSoundEffect = (soundKey: SoundKey): void => {
  try {
    const a = new Audio(resolveSoundUrl(SOUND_FILES[soundKey]));
    a.preload = 'auto';
    a.volume = 0.02;
    void a.play().then(
      () => {
        a.pause();
        a.removeAttribute('src');
        a.load();
      },
      () => {},
    );
  } catch {
    /* ignore */
  }
};
