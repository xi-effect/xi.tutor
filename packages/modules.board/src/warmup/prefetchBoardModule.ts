let boardModulePrefetch: Promise<unknown> | null = null;

/** Подгружает DrawBoard и зависимости — тот же граф, что при открытии доски. */
export function prefetchBoardModule(): Promise<unknown> {
  if (!boardModulePrefetch) {
    boardModulePrefetch = import('../ui/DrawBoard').catch((error) => {
      boardModulePrefetch = null;
      throw error;
    });
  }

  return boardModulePrefetch;
}
