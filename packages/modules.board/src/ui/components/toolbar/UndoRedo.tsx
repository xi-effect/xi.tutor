import { useCanRedo, useCanUndo, useEditor } from '@ibodr/draw';
import { Undo, Redo } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useYjsContext } from '../../../providers/YjsProvider';

export const UndoRedo = ({ direction = 'row' }: { direction?: 'row' | 'column' }) => {
  const editor = useEditor();
  const { isReadonly } = useYjsContext();
  const canUndo = useCanUndo() && !isReadonly;
  const canRedo = useCanRedo() && !isReadonly;

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center justify-center gap-1',
        direction === 'column' && 'flex-col',
      )}
    >
      <button
        aria-label="Undo"
        disabled={!canUndo}
        type="button"
        className="bg-background-surface hover:bg-status-info-background flex size-6 items-center justify-center rounded-[8px] lg:size-8"
        onClick={() => {
          if (!canUndo) return;
          editor.undo();
        }}
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
        onClick={() => {
          if (!canRedo) return;
          editor.redo();
        }}
      >
        <Redo
          className={`h-5 w-5 lg:h-6 lg:w-6 ${canRedo ? 'fill-icon-primary' : 'fill-icon-disabled'}`}
        />
      </button>
    </div>
  );
};
