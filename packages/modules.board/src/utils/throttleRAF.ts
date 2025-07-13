/* eslint-disable @typescript-eslint/no-explicit-any */
export const throttleRAF = <T extends (...args: any[]) => void>(fn: T): T => {
  let running = false;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore – generic cast
  return function (...args: any[]) {
    if (running) return;
    running = true;
    requestAnimationFrame(() => {
      running = false;
      fn(...args);
    });
  } as T;
};
