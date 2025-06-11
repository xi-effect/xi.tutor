import { File, Note, Board } from './components';

export const MaterialsAdd = () => {
  return (
    <div className="ml-auto flex flex-row items-center gap-2">
      <File />
      <Note />
      <Board />
    </div>
  );
};
