import { describe, expect, it } from 'vitest';
import { fitDisplayVideo } from '../media';

describe('fitDisplayVideo', () => {
  it('заменяет ideal-размер LiveKit на max, сохраняя остальные ограничения', () => {
    expect(
      fitDisplayVideo({
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        aspectRatio: 16 / 9,
        frameRate: 30,
      }),
    ).toEqual({ width: { max: 1920 }, height: { max: 1080 }, frameRate: 30 });
  });

  it('не трогает video без размеров', () => {
    expect(fitDisplayVideo(true)).toBe(true);
    const video = { frameRate: 15 };
    expect(fitDisplayVideo(video)).toBe(video);
  });
});
