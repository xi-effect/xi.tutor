import { afterEach, describe, expect, it } from 'vitest';
import { BoardProblem, reportBoardProblem, setBoardProblemReporter } from '../boardProblem';

describe('reportBoardProblem', () => {
  afterEach(() => {
    setBoardProblemReporter(null);
  });

  it('даёт ошибке имя области, чтобы трекер не склеивал разные сбои', () => {
    const problem = reportBoardProblem('pdf-load', new Error('network down'), { shapeId: 's1' });

    expect(problem).toBeInstanceOf(BoardProblem);
    expect(problem.name).toBe('BoardProblem.pdf-load');
    expect(problem.area).toBe('pdf-load');
    expect(problem.message).toBe('network down');
    expect(problem.details).toEqual({ shapeId: 's1' });
    expect(problem.source).toBeInstanceOf(Error);
  });

  it('передаёт ошибку подключённому репортёру и не падает, если репортёр бросает', () => {
    const seen: BoardProblem[] = [];
    setBoardProblemReporter((problem) => {
      seen.push(problem);
      throw new Error('tracker down');
    });

    expect(() => reportBoardProblem('yjs-auth', 'permission-denied')).not.toThrow();
    expect(seen).toHaveLength(1);
    expect(seen[0]?.name).toBe('BoardProblem.yjs-auth');
    expect(seen[0]?.message).toBe('permission-denied');
  });

  it('не подменяет уже размеченную ошибку', () => {
    const original = new BoardProblem('board-render', 'render failed');
    const problem = reportBoardProblem('activity-render', original);

    expect(problem).toBe(original);
    expect(problem.name).toBe('BoardProblem.board-render');
  });
});
