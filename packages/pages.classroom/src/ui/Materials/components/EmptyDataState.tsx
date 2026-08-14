import { EmptyMaterials } from 'common.ui';
import { SectionEmptyState } from '../../SectionEmptyState';
import { sectionEmptyStateIllustrationClass } from '../../sectionEmptyStateIllustrationClass';

type EmptyDataStateProps = {
  title: string;
  description?: string;
};

export const EmptyDataState = ({ title, description }: EmptyDataStateProps) => {
  return (
    <SectionEmptyState
      title={title}
      description={description}
      minHeightClass="min-h-[160px]"
      illustration={<EmptyMaterials className={sectionEmptyStateIllustrationClass} />}
    />
  );
};
