import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TAG_ASSIGN_MAX_COUNT, type TagSchema, useSetMaterialTags } from 'common.services';
import { AssignGenericTagsPopover } from './AssignGenericTagsPopover';

type AssignMaterialTagsPopoverProps = {
  materialId: string;
  tagIds: number[];
  tags: TagSchema[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export const AssignMaterialTagsPopover = ({
  materialId,
  tagIds,
  tags,
  open,
  onOpenChange,
  children,
}: AssignMaterialTagsPopoverProps) => {
  const { t } = useTranslation('materialsCard');
  const setTags = useSetMaterialTags();

  return (
    <AssignGenericTagsPopover
      tagIds={tagIds}
      tags={tags}
      maxCount={TAG_ASSIGN_MAX_COUNT}
      isPending={setTags.isPending}
      open={open}
      onOpenChange={onOpenChange}
      onChange={(nextIds) => setTags.mutate({ materialId, tagIds: nextIds })}
      labels={{
        title: t('tags.title'),
        searchPlaceholder: t('tags.searchPlaceholder'),
        loading: t('tags.loading'),
        none: t('tags.none'),
        empty: t('tags.empty'),
        manage: t('tags.manage'),
      }}
    >
      {children}
    </AssignGenericTagsPopover>
  );
};
