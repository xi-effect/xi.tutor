import { FONT_FIT_BINARY_SEARCH_STEPS } from '../consts';

export const fitFontSizeFor = (
  ghostEl: HTMLDivElement,
  text: string,
  width: number,
  maxFontSize: number,
  minFontSize: number,
  lineHeight: number,
  availableHeight: number,
): number => {
  if (availableHeight <= 0 || width <= 0) return minFontSize;

  ghostEl.style.width = `${width}px`;
  ghostEl.style.lineHeight = `${lineHeight}`;
  ghostEl.textContent = text || ' ';

  const fitsAt = (fontSize: number) => {
    ghostEl.style.fontSize = `${fontSize}px`;
    return ghostEl.scrollHeight <= availableHeight;
  };

  if (fitsAt(maxFontSize)) return maxFontSize;

  let lo = minFontSize;
  let hi = maxFontSize;
  for (let i = 0; i < FONT_FIT_BINARY_SEARCH_STEPS; i++) {
    const mid = (lo + hi) / 2;
    if (fitsAt(mid)) lo = mid;
    else hi = mid;
  }
  return fitsAt(lo) ? lo : minFontSize;
};
