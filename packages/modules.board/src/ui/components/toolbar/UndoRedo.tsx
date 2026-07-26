import { Undo, Redo } from '@xipkg/icons';

export const UndoRedo = ({
  undo,
  redo,
  canUndo,
  canRedo,
}: {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) => {
  return (
    <div className="pointer-events-auto flex items-center justify-center gap-1">
      <button
        aria-label="Undo"
        disabled={!canUndo}
        type="button"
        className="bg-background-surface hover:bg-status-info-background flex size-6 items-center justify-center rounded-[8px] lg:size-8"
        onClick={() => undo()}
      >
        <Undo
          className={`h-5 w-5 lg:h-6 lg:w-6 ${canUndo ? 'fill-icon-primary' : 'fill-icon-disabled'}`}
        />
      </button>
      <button
        aria-label="Redo"
        disabled={!canRedo}
        type="button"
        className="bg-background-surface hover:bg-status-info-background flex size-6 items-center justify-center rounded-[8px] lg:size-8"
        onClick={() => redo()}
      >
        <Redo
          className={`h-5 w-5 lg:h-6 lg:w-6 ${canRedo ? 'fill-icon-primary' : 'fill-icon-disabled'}`}
        />
      </button>
    </div>
  );
};
