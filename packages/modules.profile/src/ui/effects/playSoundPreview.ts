import type { SoundKey } from 'common.ui';
import { playSoundEffect } from 'common.ui';

/** Воспроизводит превью эффекта на заданной громкости (0–1). */
export const playSoundPreview = (soundKey: SoundKey, volume: number): void => {
  playSoundEffect(soundKey, volume > 0 ? volume : 0.25);
};
