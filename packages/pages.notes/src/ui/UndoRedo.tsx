import { Undo, Redo } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { useYjsContext } from 'modules.editor';

export const UndoRedo = () => {
  const { t } = useTranslation('notes');
  const { undo, redo, canUndo, canRedo, isReadOnly } = useYjsContext();
  const undoEnabled = canUndo && !isReadOnly;
  const redoEnabled = canRedo && !isReadOnly;

  return (
    <div className="flex items-center justify-center gap-0.5">
      <button
        aria-label={t('undo')}
        disabled={!undoEnabled}
        type="button"
        className="flex size-6 items-center justify-center bg-transparent p-0"
        onClick={() => undo()}
      >
        <Undo className={`size-5 ${undoEnabled ? 'fill-icon-primary' : 'fill-icon-disabled'}`} />
      </button>
      <button
        aria-label={t('redo')}
        disabled={!redoEnabled}
        type="button"
        className="flex size-6 items-center justify-center bg-transparent p-0"
        onClick={() => redo()}
      >
        <Redo className={`size-5 ${redoEnabled ? 'fill-icon-primary' : 'fill-icon-disabled'}`} />
      </button>
    </div>
  );
};
