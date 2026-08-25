import { useMemo } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { cn, useMediaQuery } from '@xipkg/utils';
import {
  pageSwitcherIndicatorClass,
  pageSwitcherTabClass,
  pageSwitcherTrackClass,
} from 'common.ui';
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
import { LoadingState } from './components/LoadingState';
import { galleryShadowHeaderInsetClass, galleryShadowPadClass } from '../galleryShadowClass';
import { sectionTitleClass } from '../sectionTitleClass';

type MaterialTypeTab = 'boards' | 'notes';

export const Materials = () => {
  const { t } = useTranslation('classroom');
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const search = useSearch({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 960px)');

  const activeTab: MaterialTypeTab = search.tab === 'notes' ? 'notes' : 'boards';
  const contentType = activeTab === 'notes' ? 'note' : 'board';

  const typeTabs = useMemo(
    () => [
      { id: 'boards', label: t('materials.boards') },
      { id: 'notes', label: t('materials.notes') },
    ],
    [t],
  );

  const {
    data: classroom,
    isLoading: isClassroomLoading,
    isError: isClassroomError,
  } = useGetClassroom(Number(classroomId));

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const roleReady = !isUserLoading && user != null;

  const tutorList = useGetClassroomMaterialsList({
    classroomId: classroomId || '',
    content_type: contentType,
    disabled: !classroomId || !roleReady || !isTutor,
  });
  const studentList = useGetClassroomMaterialsListStudent({
    classroomId: classroomId || '',
    content_type: contentType,
    disabled: !classroomId || !roleReady || isTutor,
  });

  const {
    data: materials,
    isLoading: isMaterialsLoading,
    isError: isMaterialsError,
  } = isTutor ? tutorList : studentList;

  const handleTypeChange = (tabId: string) => {
    if (tabId !== 'boards' && tabId !== 'notes') return;
    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId },
      search: (prev) => ({
        ...prev,
        tab: tabId,
      }),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pt-2">
      <div className="shrink-0 pr-5 sm:pr-8 md:pr-10">
        <div
          className={cn(
            'flex min-w-0 flex-row flex-wrap items-center gap-3 sm:gap-4',
            galleryShadowHeaderInsetClass,
          )}
        >
          <h2 className={sectionTitleClass}>{t('tabs.materials')}</h2>
          <SwitcherAnimate
            tabs={typeTabs}
            activeTab={activeTab}
            onChange={handleTypeChange}
            className={cn(pageSwitcherTrackClass, 'w-auto')}
            tabClassName={pageSwitcherTabClass}
            indicatorClassName={pageSwitcherIndicatorClass}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="pr-5 pb-5 sm:pr-8 sm:pb-8 md:pr-10">
          <div className={galleryShadowPadClass}>
            {isClassroomError || isMaterialsError || (!isClassroomLoading && !classroom) ? (
              <ErrorState />
            ) : isClassroomLoading || isMaterialsLoading || !roleReady ? (
              <LoadingState />
            ) : !materials?.length ? (
              <EmptyDataState
                title={activeTab === 'boards' ? t('materials.noBoards') : t('materials.noNotes')}
                description={
                  activeTab === 'boards'
                    ? t('materials.noBoardsDescription')
                    : t('materials.noNotesDescription')
                }
              />
            ) : (
              <div
                className={cn(
                  'grid gap-5',
                  isMobile ? 'grid-cols-1' : 'grid-cols-[repeat(auto-fill,minmax(300px,1fr))]',
                )}
              >
                {materials.map((material) => (
                  <MaterialsCard
                    key={material.id}
                    {...material}
                    layout="gallery"
                    className="h-40 w-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
