/**
 * Звуки таймера доски: `apps/xi.web/public/sounds/board-timer-*.mp3`.
 * Autoplay: вызывайте unlockBoardTimerAudio() из click/pointerdown (колокольчик, панель, первый tap).
 *
 * Разблокировка через одноразовые Audio — не трогаем кэшированные элементы,
 * иначе async-колбэк после «тихого» play мог обрывать реальное воспроизведение.
 */

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

const URL_TO_END = resolveSoundUrl('board-timer-to-end.mp3');
const URL_END = resolveSoundUrl('board-timer-end.mp3');

let audioToEnd: HTMLAudioElement | null = null;
let audioEnd: HTMLAudioElement | null = null;

const getAudioToEnd = (): HTMLAudioElement => {
  if (!audioToEnd) {
    audioToEnd = new Audio(URL_TO_END);
    audioToEnd.preload = 'auto';
    void audioToEnd.load();
  }
  return audioToEnd;
};

const getAudioEnd = (): HTMLAudioElement => {
  if (!audioEnd) {
    audioEnd = new Audio(URL_END);
    audioEnd.preload = 'auto';
    void audioEnd.load();
  }
  return audioEnd;
};

export function unlockBoardTimerAudio(): void {
  const primeDisposable = (url: string) => {
    try {
      const a = new Audio(url);
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

  try {
    primeDisposable(URL_TO_END);
    primeDisposable(URL_END);
  } catch {
    /* ignore */
  }
}

export function playBoardTimerWarnSound(): void {
  const audio = getAudioToEnd();
  try {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
    void audio.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

export function playBoardTimerEndSound(): void {
  const audio = getAudioEnd();
  try {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
    void audio.play().catch(() => {});
  } catch {
    /* ignore */
  }
}
