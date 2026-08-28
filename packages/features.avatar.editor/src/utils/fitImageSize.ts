export const AVATAR_MAX_SIZE = 256;

export function fitImageSize(
  width: number,
  height: number,
  maxSize: number = AVATAR_MAX_SIZE,
): { width: number; height: number } {
  if (width <= 0 || height <= 0) {
    return { width: 1, height: 1 };
  }

  if (width <= maxSize && height <= maxSize) {
    return { width, height };
  }

  if (width >= height) {
    return {
      width: maxSize,
      height: Math.max(1, Math.round((height * maxSize) / width)),
    };
  }

  return {
    width: Math.max(1, Math.round((width * maxSize) / height)),
    height: maxSize,
  };
}
