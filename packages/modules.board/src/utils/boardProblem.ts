export const BOARD_PROBLEM_AREAS = [
  'chrome-sync',
  'yjs-auth',
  'yjs-hydrate',
  'pdf-load',
  'pdf-render',
  'presentation-load',
  'presentation-render',
  'asset-resolve',
  'image-display',
  'audio-load',
  'activity-render',
  'board-render',
] as const;

export type BoardProblemArea = (typeof BOARD_PROBLEM_AREAS)[number];

export type BoardProblemDetails = Record<string, string | number | boolean | null>;

type BoardProblemOptions = {
  cause?: unknown;
  details?: BoardProblemDetails;
};

/**
 * Имя вида `BoardProblem.pdf-load` — отдельная группа в трекере.
 * Сообщение остаётся от исходной ошибки, чтобы было видно и место, и причину.
 */
export class BoardProblem extends Error {
  readonly area: BoardProblemArea;
  readonly details?: BoardProblemDetails;
  /** Исходный сбой. Отдельное поле: цель сборки ES2020, у Error нет cause. */
  readonly source?: unknown;

  constructor(area: BoardProblemArea, message: string, options?: BoardProblemOptions) {
    super(message);
    this.name = `BoardProblem.${area}`;
    this.area = area;
    this.details = options?.details;
    this.source = options?.cause;
  }
}

type BoardProblemReporter = (problem: BoardProblem) => void;

let reporter: BoardProblemReporter | null = null;

/** Приложение подключает трекер. Без подключения ошибка остаётся в консоли. */
export function setBoardProblemReporter(next: BoardProblemReporter | null) {
  reporter = next;
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === 'string' && error.trim()) return error;
  return 'Unknown board problem';
}

export function reportBoardProblem(
  area: BoardProblemArea,
  error: unknown,
  details?: BoardProblemDetails,
): BoardProblem {
  const problem =
    error instanceof BoardProblem
      ? error
      : new BoardProblem(area, messageOf(error), { cause: error, details });

  console.error(`[board:${problem.area}]`, problem.message, problem.details ?? '');

  try {
    reporter?.(problem);
  } catch {
    // Сбой отправки не должен ронять доску.
  }

  return problem;
}
