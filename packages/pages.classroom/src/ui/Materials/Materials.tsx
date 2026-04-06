import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroom,
  useGetClassroomMaterialsList,
  useGetClassroomMaterialsListStudent,
} from 'common.services';
import { MaterialsCard } from 'features.materials.card';
import { EmptyDataState } from './components/EmptyDataState';
import { ErrorState } from './components/ErrorState';
import { MaterialSection } from './components/MaterialSection';
import { LoadingState } from './components/LoadingState';

export const Materials = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const getList = isTutor ? useGetClassroomMaterialsList : useGetClassroomMaterialsListStudent;

  const {
    data: boardsData,
    isLoading: isBoardsLoading,
    isError: isBoardsError,
  } = getList({
    classroomId: classroomId || '',
    content_type: 'board',
    disabled: !classroomId,
  });

  const {
    data: notesData,
    isLoading: isNotesLoading,
    isError: isNotesError,
  } = getList({
    classroomId: classroomId || '',
    content_type: 'note',
    disabled: !classroomId,
  });

  if (isLoading || isBoardsLoading || isNotesLoading) {
    return <LoadingState />;
  }

  if (isError || isBoardsError || isNotesError || !classroom) {
    return <ErrorState />;
  }

  return (
    <div className="flex flex-col">
      <MaterialSection headerTitle="Учебные доски" rowClassName="pb-4">
        {boardsData?.length ? (
          boardsData.map((board) => (
            <MaterialsCard key={board.id} {...board} hasIcon className="2xl:w-[430px]" />
          ))
        ) : (
          <EmptyDataState title="Нет учебных досок" />
        )}
      </MaterialSection>
      <MaterialSection headerTitle="Заметки">
        {notesData?.length ? (
          notesData.map((note) => (
            <MaterialsCard key={note.id} {...note} hasIcon className="2xl:w-[430px]" />
          ))
        ) : (
          <EmptyDataState title="Нет заметок" />
        )}
      </MaterialSection>
    </div>
  );
};
