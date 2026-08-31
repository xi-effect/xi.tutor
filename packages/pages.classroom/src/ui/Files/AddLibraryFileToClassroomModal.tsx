import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Modal, ModalContent, ModalDescription, ModalTitle } from '@xipkg/modal';
import { cn } from '@xipkg/utils';
import { useAttachClassroomFile, useSearchLibraryFiles } from 'common.services';
import { matchesSearchQuery } from 'common.utils';
import {
  ModalCloseIcon,
  modalCancelButtonClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalDescriptionClass,
  modalFooterClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';
import { getLibraryFileDisplayName } from 'pages.materials';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

type AddLibraryFileToClassroomModalProps = {
  classroomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const AddLibraryFileToClassroomModal = ({
  classroomId,
  open,
  onOpenChange,
}: AddLibraryFileToClassroomModalProps) => {
  const { t } = useTranslation('classroom');
  const { t: tMaterials } = useTranslation('materials');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { files, isLoading } = useSearchLibraryFiles({ enabled: open });
  const attachMutation = useAttachClassroomFile();

  const filteredFiles = useMemo(() => {
    const query = search.trim();
    if (!query) return files;
    return files.filter((file) => matchesSearchQuery(getLibraryFileDisplayName(file), query));
  }, [files, search]);

  const selected = files.find((file) => file.id === selectedId) ?? null;

  const handleClose = () => {
    setSearch('');
    setSelectedId(null);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!selected) return;
    attachMutation.mutate(
      { classroomId, fileId: selected.id },
      {
        onSuccess: () => handleClose(),
        onError: (error) => {
          if (error instanceof AxiosError && error.response?.status === 409) {
            toast.error(tMaterials('files.share.alreadyAddedError'));
          }
        },
      },
    );
  };

  return (
    <Modal open={open} onOpenChange={(next) => (!next ? handleClose() : onOpenChange(next))}>
      <ModalContent className={modalContentClass} aria-describedby={undefined}>
        <div className={modalHeaderRowClass}>
          <div className="flex min-w-0 flex-col gap-1">
            <ModalTitle className={modalTitleClass}>{t('files.addFromLibrary')}</ModalTitle>
            <ModalDescription className={modalDescriptionClass}>
              {t('files.addFromLibraryDescription')}
            </ModalDescription>
          </div>
          <ModalCloseIcon onClick={handleClose} />
        </div>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={tMaterials('files.searchPlaceholder')}
        />

        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {isLoading ? (
            <p className="text-text-secondary py-6 text-center text-sm">{t('files.loading')}</p>
          ) : filteredFiles.length === 0 ? (
            <p className="text-text-secondary py-6 text-center text-sm">
              {t('files.libraryEmpty')}
            </p>
          ) : (
            filteredFiles.map((file) => (
              <button
                key={file.id}
                type="button"
                className={cn(
                  'hover:bg-background-subtle flex w-full items-center rounded-xl px-3 py-2 text-left',
                  selectedId === file.id && 'bg-status-info-background',
                )}
                onClick={() => setSelectedId(file.id)}
              >
                <span className="text-text-primary truncate text-sm font-medium">
                  {getLibraryFileDisplayName(file)}
                </span>
              </button>
            ))
          )}
        </div>

        <div className={modalFooterClass}>
          <Button
            type="button"
            variant="none"
            className={modalCancelButtonClass}
            onClick={handleClose}
          >
            {tMaterials('files.share.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            className={modalConfirmButtonClass}
            disabled={!selected || attachMutation.isPending}
            loading={attachMutation.isPending}
            onClick={handleSubmit}
          >
            {t('files.add')}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};
