import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TAG_FILE_ASSIGN_MAX_COUNT,
  getFileTagIds,
  type LibraryFile,
  useSetFileTags,
  useTagsByIds,
} from 'common.services';
import { AssignGenericTagsPopover } from 'features.materials.card';

type AssignFileTagsPopoverProps = {
  file: LibraryFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export const AssignFileTagsPopover = ({
  file,
  open,
  onOpenChange,
  children,
}: AssignFileTagsPopoverProps) => {
  const { t } = useTranslation('materials');
  const tagIds = getFileTagIds(file);
  const { tags } = useTagsByIds(tagIds);
  const setTags = useSetFileTags();

  return (
    <AssignGenericTagsPopover
      tagIds={tagIds}
      tags={tags}
      maxCount={TAG_FILE_ASSIGN_MAX_COUNT}
      isPending={setTags.isPending}
      open={open}
      onOpenChange={onOpenChange}
      onChange={(nextIds) => setTags.mutate({ fileId: file.id, tagIds: nextIds })}
      labels={{
        title: t('tags.title'),
        searchPlaceholder: t('tags.searchPlaceholder'),
        loading: t('tags.loading'),
        none: t('assignTags.none'),
        empty: t('tags.empty'),
      }}
    >
      {children}
    </AssignGenericTagsPopover>
  );
};
