export const measureTextHeight = (fontSize: number, fontFamily = 'Arial') => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return fontSize;

  ctx.font = `${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText('M');
  return (
    (metrics.actualBoundingBoxAscent || fontSize * 0.8) +
    (metrics.actualBoundingBoxDescent || fontSize * 0.2)
  );
};
