/**
 * Утилита для воспроизведения звуков уведомлений в ВКС
 */

const SOUND_PATHS = {
  chatMessage: '/sounds/chat-message.wav',
  handRaise: '/sounds/hand-raise.wav',
  userJoin: '/sounds/user-join-to-call.mp3',
  userLeft: '/sounds/user-left-from-call.mp3',
} as const;

type SoundType = keyof typeof SOUND_PATHS;

/** Для join/left — воспроизводим только начало файла (мс). */
const JOIN_LEAVE_PLAY_MS = 500;

type TrimmedSoundType = Extract<SoundType, 'userJoin' | 'userLeft'>;
const trimTimeouts = new Map<TrimmedSoundType, ReturnType<typeof setTimeout>>();

// Кэш для Audio объектов, чтобы не создавать их каждый раз
const soundCache = new Map<SoundType, HTMLAudioElement>();

/**
 * Получает или создает Audio объект для звука
 */
const getAudio = (soundType: SoundType): HTMLAudioElement => {
  if (!soundCache.has(soundType)) {
    const audio = new Audio(SOUND_PATHS[soundType]);
    audio.preload = 'auto';
    soundCache.set(soundType, audio);
  }
  return soundCache.get(soundType)!;
};

const clearJoinLeaveTrim = (soundType: TrimmedSoundType) => {
  const id = trimTimeouts.get(soundType);
  if (id !== undefined) {
    clearTimeout(id);
    trimTimeouts.delete(soundType);
  }
};

const scheduleJoinLeaveTrim = (audio: HTMLAudioElement, soundType: TrimmedSoundType) => {
  clearJoinLeaveTrim(soundType);
  const id = setTimeout(() => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      /* ignore */
    }
    trimTimeouts.delete(soundType);
  }, JOIN_LEAVE_PLAY_MS);
  trimTimeouts.set(soundType, id);
};

/**
 * Воспроизводит звук с указанной громкостью
 * @param soundType - тип звука (chatMessage или handRaise)
 * @param volume - громкость от 0 до 1 (0 = беззвучно, 1 = максимальная громкость)
 */
export const playSound = (soundType: SoundType, volume: number = 1): void => {
  try {
    const audio = getAudio(soundType);

    if (soundType === 'userJoin' || soundType === 'userLeft') {
      clearJoinLeaveTrim(soundType);
    }

    // Устанавливаем громкость (от 0 до 1)
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audio.volume = clampedVolume;

    // Сбрасываем позицию на начало и воспроизводим
    audio.currentTime = 0;
    void audio
      .play()
      .then(() => {
        if (soundType === 'userJoin' || soundType === 'userLeft') {
          scheduleJoinLeaveTrim(audio, soundType);
        }
      })
      .catch((error) => {
        // Игнорируем ошибки воспроизведения (например, если пользователь не взаимодействовал со страницей)
        console.warn(`⚠️ Failed to play sound ${soundType}:`, error);
      });
  } catch (error) {
    console.error(`❌ Error playing sound ${soundType}:`, error);
  }
};
