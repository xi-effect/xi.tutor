export const PREVIEW_ZOOM_MIN = 1;
export const PREVIEW_ZOOM_MAX = 4;
export const PREVIEW_ZOOM_STEP = 0.2;
export const PREVIEW_ZOOM_WHEEL_INTENSITY = 0.0028;

export const clampPreviewZoom = (value: number) =>
  Math.min(PREVIEW_ZOOM_MAX, Math.max(PREVIEW_ZOOM_MIN, Math.round(value * 100) / 100));

export const stepPreviewZoom = (current: number, direction: 1 | -1) => {
  if (direction > 0) {
    return clampPreviewZoom(Math.ceil((current + 0.001) / PREVIEW_ZOOM_STEP) * PREVIEW_ZOOM_STEP);
  }

  return clampPreviewZoom(Math.floor((current - 0.001) / PREVIEW_ZOOM_STEP) * PREVIEW_ZOOM_STEP);
};

export const wheelPreviewZoom = (current: number, deltaY: number, deltaMode: number) => {
  let dy = deltaY;
  if (deltaMode === 1) dy *= 16;
  if (deltaMode === 2) dy *= 800;

  return clampPreviewZoom(current * Math.exp(-dy * PREVIEW_ZOOM_WHEEL_INTENSITY));
};
