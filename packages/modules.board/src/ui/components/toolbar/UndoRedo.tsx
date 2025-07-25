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
        className="bg-gray-0 hover:bg-brand-0 flex size-6 items-center justify-center rounded-[8px] lg:size-8"
        onClick={() => undo()}
      >
        <Undo className={`${canUndo ? null : 'fill-gray-40'} h-5 w-5 lg:h-6 lg:w-6`} />
      </button>
      <button
        aria-label="Redo"
        disabled={!canRedo}
        type="button"
        className="bg-gray-0 hover:bg-brand-0 flex size-6 items-center justify-center rounded-[8px] lg:size-8"
        onClick={() => redo()}
      >
        <Redo className={`${canRedo ? null : 'fill-gray-40'} h-5 w-5 lg:h-6 lg:w-6`} />
      </button>
    </div>
  );
};
