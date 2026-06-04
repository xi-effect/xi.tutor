/** Целые пиксели — убирает дрожание текста при resize/zoom. */
export function snapText(n: number): number {
  return Math.round(n);
}

/** Половинные пиксели — чёткие 1px-линии сетки. */
export function snapLine(n: number): number {
  return Math.round(n) + 0.5;
}
