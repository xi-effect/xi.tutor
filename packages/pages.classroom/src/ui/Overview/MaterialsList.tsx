import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomMaterialsList,
  useGetClassroomMaterialsListStudent,
} from 'common.services';
import { ClassroomMaterialsT } from 'common.types';
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

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const getList = isTutor ? useGetClassroomMaterialsList : useGetClassroomMaterialsListStudent;

  const {
    data: materials,
    isLoading,
    isError,
  } = getList({
    classroomId: classroomId || '',
    content_type: null,
    disabled: !classroomId,
  });

  if (isLoading) {
    return (
      <WidgetCardsCarousel>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={widgetCardSlotClass}>
            <MaterialsListSkeleton className="h-40 w-full" />
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

  if (!materials || materials.length === 0) {
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
      {materials.map((material: ClassroomMaterialsT) => (
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
