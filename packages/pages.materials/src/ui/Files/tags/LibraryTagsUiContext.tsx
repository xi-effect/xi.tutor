import { type ReactNode } from 'react';
import { useLibraryTagsManage } from './libraryTagsUiStore';
import { TagManageModal } from './TagManageModal';

export const LibraryTagsUiProvider = ({ children }: { children: ReactNode }) => {
  const { manageOpen, setManageOpen } = useLibraryTagsManage();

  return (
    <>
      {children}
      <TagManageModal open={manageOpen} onOpenChange={setManageOpen} />
    </>
  );
};
