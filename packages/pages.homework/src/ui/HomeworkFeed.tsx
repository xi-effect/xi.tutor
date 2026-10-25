import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { useMediaQuery } from '@xipkg/utils';
import type { HomeworkItem, HomeworkTab } from '../types';
import { HomeworkCard } from './HomeworkCard';
import { HomeworkEmptyState } from './HomeworkEmptyState';

type HomeworkFeedProps = {
  activeTab: HomeworkTab;
  items: HomeworkItem[];
  parentRef: RefObject<HTMLDivElement | null>;
  onChange: (id: string, value: { title: string; description: string }) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onCreateFromTemplate: (id: string) => void;
};

const emptyCopy: Record<HomeworkTab, { title: string; description: string }> = {
  active: { title: 'empty.activeTitle', description: 'empty.activeDescription' },
  templates: { title: 'empty.templatesTitle', description: 'empty.templatesDescription' },
  archive: { title: 'empty.archiveTitle', description: 'empty.archiveDescription' },
};

export const HomeworkFeed = ({
  activeTab,
  items,
  parentRef,
  onChange,
  onDuplicate,
  onArchive,
  onRestore,
  onCreateFromTemplate,
}: HomeworkFeedProps) => {
  const { t } = useTranslation('homework');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const visible = items
    .filter((item) => item.feed === activeTab)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  if (visible.length === 0) {
    const copy = emptyCopy[activeTab];
    return <HomeworkEmptyState title={t(copy.title)} description={t(copy.description)} />;
  }

  return (
    <GridVirtualizer
      parentRef={parentRef}
      items={visible}
      defaultRowHeight={176}
      minItemWidth={300}
      gap={20}
      maxColumns={4}
      isSingleColumn={isMobile}
      renderItem={(item) => (
        <HomeworkCard
          item={item}
          className="w-full"
          onChange={onChange}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
          onRestore={onRestore}
          onCreateFromTemplate={onCreateFromTemplate}
        />
      )}
    />
  );
};
