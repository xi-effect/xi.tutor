import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroom,
  useGetClassroomMaterialsList,
  useGetClassroomMaterialsListStudent,
} from 'common.services';
import { MaterialsCard } from 'features.materials.card';
import { useTranslation } from 'react-i18next';
import { EmptyDataState } from './components/EmptyDataState';
import { ErrorState } from './components/ErrorState';
import { MaterialSection } from './components/MaterialSection';
import { LoadingState } from './components/LoadingState';
import { WidgetCardsCarousel, widgetCardSlotClass } from '../WidgetCardsCarousel';

export const Materials = () => {
  const { t } = useTranslation('classroom');
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
    <div className="flex min-h-[400px] flex-col gap-8 pt-2">
      <MaterialSection headerTitle={t('materials.boards')}>
        {boardsData?.length ? (
          <WidgetCardsCarousel>
            {boardsData.map((board) => (
              <div key={board.id} className={widgetCardSlotClass}>
                <MaterialsCard {...board} layout="gallery" className="h-full w-full" />
              </div>
            ))}
          </WidgetCardsCarousel>
        ) : (
          <EmptyDataState
            title={t('materials.noBoards')}
            description={t('materials.noBoardsDescription')}
          />
        )}
      </MaterialSection>
      <MaterialSection headerTitle={t('materials.notes')}>
        {notesData?.length ? (
          <WidgetCardsCarousel>
            {notesData.map((note) => (
              <div key={note.id} className={widgetCardSlotClass}>
                <MaterialsCard {...note} layout="gallery" className="h-full w-full" />
              </div>
            ))}
          </WidgetCardsCarousel>
        ) : (
          <EmptyDataState
            title={t('materials.noNotes')}
            description={t('materials.noNotesDescription')}
          />
        )}
      </MaterialSection>
    </div>
  );
};
