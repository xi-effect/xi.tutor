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
        title: t('files.assignTags.title'),
        searchPlaceholder: t('files.tags.searchPlaceholder'),
        loading: t('files.tags.loading'),
        none: t('files.assignTags.none'),
        empty: t('files.tags.empty'),
        manage: t('files.assignTags.manage'),
      }}
    >
      {children}
    </AssignGenericTagsPopover>
  );
};
