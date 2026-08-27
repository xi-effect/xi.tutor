import { describe, expect, it } from 'vitest';
import { AVATAR_MAX_SIZE, fitImageSize } from '../fitImageSize';

describe('fitImageSize', () => {
  it('не увеличивает картинку меньше лимита', () => {
    expect(fitImageSize(128, 128)).toEqual({ width: 128, height: 128 });
    expect(fitImageSize(200, 100, 256)).toEqual({ width: 200, height: 100 });
  });

  it('сохраняет пропорции при уменьшении широкой картинки', () => {
    expect(fitImageSize(512, 256, AVATAR_MAX_SIZE)).toEqual({ width: 256, height: 128 });
  });

  it('сохраняет пропорции при уменьшении высокой картинки', () => {
    expect(fitImageSize(256, 512, AVATAR_MAX_SIZE)).toEqual({ width: 128, height: 256 });
  });

  it('квадрат больше лимита сжимает до maxSize', () => {
    expect(fitImageSize(1024, 1024, 256)).toEqual({ width: 256, height: 256 });
  });

  it('не возвращает нулевые стороны', () => {
    expect(fitImageSize(0, 10, 256)).toEqual({ width: 1, height: 1 });
    expect(fitImageSize(1000, 1, 256)).toEqual({ width: 256, height: 1 });
  });
});
