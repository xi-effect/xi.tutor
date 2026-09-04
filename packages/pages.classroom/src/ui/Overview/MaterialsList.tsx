import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomMaterialsList,
  useGetClassroomMaterialsListStudent,
} from 'common.services';
import { ClassroomMaterialsT, YDocContentKind } from 'common.types';
import { MaterialsCard } from 'features.materials.card';
import { EmptyMaterials } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { MaterialsListSkeleton } from './MaterialsListSkeleton';
import { SectionEmptyState } from '../SectionEmptyState';
import { sectionEmptyStateIllustrationClass } from '../sectionEmptyStateIllustrationClass';
import { WidgetCardsCarousel, widgetCardSlotClass } from '../WidgetCardsCarousel';

export const MaterialsList = () => {
  const { t } = useTranslation('classroom');
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const roleReady = !isUserLoading && user != null;

  const tutorList = useGetClassroomMaterialsList({
    classroomId: classroomId || '',
    content_kind: null,
    disabled: !classroomId || !roleReady || !isTutor,
  });
  const studentList = useGetClassroomMaterialsListStudent({
    classroomId: classroomId || '',
    content_kind: null,
    disabled: !classroomId || !roleReady || isTutor,
  });

  const { data: materials, isError } = isTutor ? tutorList : studentList;
  const isLoading = !roleReady || (isTutor ? tutorList.isLoading : studentList.isLoading);
  const visibleMaterials = (materials ?? []).filter(
    (material): material is ClassroomMaterialsT & { content_kind: YDocContentKind } =>
      material.content_kind === 'note' || material.content_kind === 'board',
  );

  if (isLoading) {
    return (
      <WidgetCardsCarousel>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={widgetCardSlotClass}>
            <MaterialsListSkeleton />
          </div>
        ))}
      </WidgetCardsCarousel>
    );
  }

  if (isError) {
    return (
      <div className="flex h-24 w-full items-center justify-center">
        <p className="text-text-secondary">{t('materials.loadError')}</p>
      </div>
    );
  }

  if (!visibleMaterials.length) {
    return (
      <SectionEmptyState
        title={t('materials.noMaterials')}
        description={t('materials.emptyDescription')}
        minHeightClass="min-h-[160px]"
        illustration={<EmptyMaterials className={sectionEmptyStateIllustrationClass} />}
      />
    );
  }

  return (
    <WidgetCardsCarousel>
      {visibleMaterials.map((material) => (
        <div key={material.id} className={widgetCardSlotClass}>
          <MaterialsCard
            {...material}
            isLoading={isLoading}
            layout="gallery"
            className="h-full w-full"
          />
        </div>
      ))}
    </WidgetCardsCarousel>
  );
};
