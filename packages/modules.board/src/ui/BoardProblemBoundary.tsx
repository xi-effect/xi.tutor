import { Component, type ErrorInfo, type ReactNode } from 'react';
import i18n from 'i18next';
import { reportBoardProblem, type BoardProblemArea } from '../utils/boardProblem';

type BoundaryArea = Extract<BoardProblemArea, 'board-render' | 'activity-render'>;

type Props = {
  area: BoundaryArea;
  children: ReactNode;
};

type State = { failed: boolean };

/** Ловит падение отрисовки и помечает его отдельной ошибкой, не сваливая всю страницу. */
export class BoardProblemBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportBoardProblem(this.props.area, error, {
      componentStack: info.componentStack?.slice(0, 500) ?? null,
    });
  }

  render() {
    if (!this.state.failed) return this.props.children;

    const activity = this.props.area === 'activity-render';
    return (
      <div
        className={
          activity
            ? 'text-text-secondary flex h-full w-full items-center justify-center p-3 text-center text-xs'
            : 'text-text-secondary flex h-full w-full items-center justify-center p-6 text-center text-sm'
        }
      >
        {i18n.t(activity ? 'problem.activity' : 'problem.board', { ns: 'board' })}
      </div>
    );
  }
}
