import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { File, Image, Music, Search } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { Modal, ModalContent, ModalDescription, ModalTitle } from '@xipkg/modal';
import { cn } from '@xipkg/utils';
import { getClassroomDisplayName, type FileKind, type LibraryFile } from 'common.api';
import { useGetLibraryFileClassroomIds, useShareLibraryFileToClassroom } from 'common.services';
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
import { toast } from 'sonner';
import { useAllTutorClassrooms } from '../../hooks';
import { getLibraryFileDisplayName } from '../../utils';
import {
  getClassroomAvatarTone,
  getClassroomInitials,
  getGroupEnrollmentsCount,
  isClassroomArchived,
  isConflictError,
} from './shareClassroom';

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

const kindIcon: Record<FileKind, typeof File> = {
  image: Image,
  audio: Music,
  document: File,
  presentation: File,
  uncategorized: File,
};

type ShareFileModalProps = {
  file: LibraryFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ShareFileModal = ({ file, open, onOpenChange }: ShareFileModalProps) => {
  const { t } = useTranslation('materials');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [alreadyAddedIds, setAlreadyAddedIds] = useState<Set<number>>(() => new Set());
  const { classrooms, isLoading: isClassroomsLoading } = useAllTutorClassrooms(open);
  const { data: classroomIds, isLoading: isClassroomIdsLoading } = useGetLibraryFileClassroomIds(
    file.id,
    !open,
  );
  const shareMutation = useShareLibraryFileToClassroom();
  const isLoading = isClassroomsLoading || isClassroomIdsLoading;
  const knownAlreadyAddedIds = useMemo(() => {
    const next = new Set(classroomIds);
    alreadyAddedIds.forEach((id) => next.add(id));
    return next;
  }, [alreadyAddedIds, classroomIds]);

  const displayName = getLibraryFileDisplayName(file);
  const Icon = kindIcon[file.kind] ?? File;

  useEffect(() => cleanupBodyScrollLock, []);

  useEffect(() => {
    if (open) {
      return;
    }

    setSearch('');
    setSelectedId(null);
  }, [open]);

  useEffect(() => {
    setAlreadyAddedIds(new Set());
    setSelectedId(null);
    setSearch('');
  }, [file.id]);

  useEffect(() => {
    if (selectedId != null && knownAlreadyAddedIds.has(selectedId)) {
      setSelectedId(null);
    }
  }, [knownAlreadyAddedIds, selectedId]);

  const filteredClassrooms = useMemo(() => {
    const query = search.trim();

    return classrooms.filter((classroom) => {
      const name = getClassroomDisplayName(classroom);
      return matchesSearchQuery(name, query);
    });
  }, [classrooms, search]);

  const selectedClassroom = classrooms.find((classroom) => classroom.id === selectedId);
  const canShare =
    selectedClassroom != null &&
    !isClassroomArchived(selectedClassroom) &&
    !knownAlreadyAddedIds.has(selectedClassroom.id) &&
    !shareMutation.isPending;

  const handleClose = () => {
    if (shareMutation.isPending) {
      return;
    }

    onOpenChange(false);
    cleanupBodyScrollLock();
  };

  const handleShare = () => {
    if (!selectedClassroom || !canShare) {
      return;
    }

    shareMutation.mutate(
      {
        fileId: file.id,
        classroomId: selectedClassroom.id,
        name: displayName,
      },
      {
        onSuccess: () => {
          setAlreadyAddedIds((current) => new Set(current).add(selectedClassroom.id));
          toast.success(t('files.share.success'));
          onOpenChange(false);
          cleanupBodyScrollLock();
        },
        onError: (error) => {
          if (isConflictError(error)) {
            setAlreadyAddedIds((current) => new Set(current).add(selectedClassroom.id));
            setSelectedId(null);
            toast.error(t('files.share.alreadyAddedError'));
          }
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next && shareMutation.isPending) {
          return;
        }

        onOpenChange(next);
      }}
    >
      <ModalContent
        className={cn(modalContentClass, 'flex max-w-170 flex-col overflow-hidden md:w-170')}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          cleanupBodyScrollLock();
        }}
      >
        <div className="flex flex-col gap-2 p-6 pb-2">
          <div className={modalHeaderRowClass}>
            <ModalTitle className={modalTitleClass}>{t('files.share.title')}</ModalTitle>
            <ModalCloseIcon
              onClick={handleClose}
              disabled={shareMutation.isPending}
              aria-label={t('files.share.close')}
            />
          </div>
          <ModalDescription className={modalDescriptionClass}>
            {t('files.share.description')}
          </ModalDescription>
        </div>

        <div className="flex flex-col gap-4 px-6">
          <div className="bg-status-info-background flex items-center gap-3 rounded-lg p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px]">
              <Icon className="fill-icon-brand size-6" />
            </div>
            <p className="text-text-link min-w-0 flex-1 truncate text-sm font-medium">
              {displayName}
            </p>
          </div>

          <div className="w-full">
            <Input
              variant="m"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('files.share.searchPlaceholder')}
              before={<Search className="fill-icon-secondary size-4" />}
              className="border-border-default border"
            />
          </div>

          <div className="flex h-96 flex-col gap-2 overflow-y-auto">
            {isLoading ? (
              <p className="text-s-base text-text-secondary py-6 text-center">
                {t('files.share.loading')}
              </p>
            ) : filteredClassrooms.length === 0 ? (
              <p className="text-s-base text-text-secondary py-6 text-center">
                {classrooms.length === 0 ? t('files.share.empty') : t('files.share.emptySearch')}
              </p>
            ) : (
              filteredClassrooms.map((classroom) => {
                const name = getClassroomDisplayName(classroom) || t('scope.unnamedClassroom');
                const archived = isClassroomArchived(classroom);
                const alreadyAdded = knownAlreadyAddedIds.has(classroom.id);
                const disabled = archived || alreadyAdded;
                const selected = selectedId === classroom.id && !disabled;
                const studentsCount = getGroupEnrollmentsCount(classroom);
                const meta =
                  classroom.kind === 'group'
                    ? studentsCount != null
                      ? t('files.share.kindGroupCount', { count: studentsCount })
                      : t('files.share.kindGroup')
                    : t('files.share.kindIndividual');

                return (
                  <button
                    key={classroom.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedId(classroom.id)}
                    data-umami-event="materials-file-share-classroom"
                    data-umami-event-classroom={classroom.id}
                    className={cn(
                      'flex w-full appearance-none items-center gap-3 rounded-xl border-0 bg-transparent px-4 py-3 text-left shadow-none outline-1 -outline-offset-1 transition-colors outline-solid',
                      selected
                        ? 'bg-status-info-background outline-border-focus'
                        : 'outline-transparent',
                      disabled
                        ? 'cursor-default opacity-50'
                        : 'hover:bg-background-subtle cursor-pointer',
                    )}
                  >
                    <div
                      className={cn(
                        'text-text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                        getClassroomAvatarTone(classroom.id),
                      )}
                    >
                      {getClassroomInitials(name)}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
                      <p className="text-text-primary truncate text-base leading-5 font-medium">
                        {name}
                      </p>
                      <p className="text-text-secondary truncate text-xs leading-4 font-normal">
                        {meta}
                      </p>
                    </div>
                    {alreadyAdded ? (
                      <span className="text-status-success-text shrink-0 text-xs font-medium">
                        {t('files.share.alreadyAdded')}
                      </span>
                    ) : null}
                    {archived ? (
                      <span className="text-tag-orange-accent shrink-0 text-xs font-medium">
                        {t('files.share.archived')}
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className={cn(modalFooterClass, 'px-6 pt-4 pb-6')}>
          <Button
            type="button"
            variant="none"
            size="m"
            className={modalCancelButtonClass}
            onClick={handleClose}
            disabled={shareMutation.isPending}
            data-umami-event="materials-file-share-cancel"
          >
            {t('files.share.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="m"
            className={modalConfirmButtonClass}
            onClick={handleShare}
            disabled={!canShare}
            data-umami-event="materials-file-share-submit"
          >
            {shareMutation.isPending ? t('files.share.sharing') : t('files.share.submit')}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};
