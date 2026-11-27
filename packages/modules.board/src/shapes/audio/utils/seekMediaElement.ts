import { clampPlaybackTime } from './syncPlayback';

const seekToken = new WeakMap<HTMLMediaElement, number>();

/**
 * Перемотка, которая дожидается метаданных.
 * На iOS присвоение currentTime до loadedmetadata проглатывается,
 * а следующий canplay иногда затирает уже выставленную позицию — поэтому поколение seek.
 */
export function seekMediaElement(audio: HTMLMediaElement, time: number): void {
  const token = (seekToken.get(audio) ?? 0) + 1;
  seekToken.set(audio, token);

  const apply = () => {
    if (seekToken.get(audio) !== token) return;
    const next = clampPlaybackTime(time, audio.duration);
    try {
      if (Number.isFinite(audio.currentTime) && Math.abs(audio.currentTime - next) < 0.03) return;
      audio.currentTime = next;
    } catch {
      /* InvalidStateError, пока нет метаданных */
    }
  };

  if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
    apply();
    if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      audio.addEventListener('canplay', apply, { once: true });
    }
    return;
  }

  audio.addEventListener(
    'loadedmetadata',
    () => {
      apply();
      if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
        audio.addEventListener('canplay', apply, { once: true });
      }
    },
    { once: true },
  );
}
