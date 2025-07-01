import { File, Note, Board } from './components';
import { useCurrentUser } from 'common.services';

export const MaterialsAdd = () => {
  const { data: user } = useCurrentUser();

  const isTutor = user?.default_layout === 'tutor';

  return (
    <div className="ml-auto flex flex-row items-center gap-2">
      {isTutor && <File />}
      <Note />
      <Board />
    </div>
  );
};
