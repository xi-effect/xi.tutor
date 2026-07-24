import { useCreateMaterial } from '../hooks/useCreateMaterial';
import { Note, Board } from './components';

type MaterialsAddProps = {
  onlyDrafts?: boolean;
  kind?: 'note' | 'board';
};

export const MaterialsAdd = ({ onlyDrafts = false, kind }: MaterialsAddProps) => {
  const { createMaterial } = useCreateMaterial();

  return (
    <div className="flex flex-row items-center gap-2">
      {(!kind || kind === 'note') && (
        <Note onlyDrafts={onlyDrafts} onCreate={() => createMaterial('note')} />
      )}

      {(!kind || kind === 'board') && (
        <Board onlyDrafts={onlyDrafts} onCreate={() => createMaterial('board')} />
      )}
    </div>
  );
};
