import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Edit, MoreVert, Search, Trash } from '@xipkg/icons';
import { Modal, ModalContent, ModalDescription, ModalTitle } from '@xipkg/modal';
import { cn } from '@xipkg/utils';
import { filterGenericTags, useLibraryTags } from 'common.services';
import {
  ConfirmDialog,
  ModalCloseIcon,
  cardMenuDeleteItemClass,
  cardMenuIconClass,
  cardMenuItemClass,
  cardMenuSeparatorClass,
  cardMenuSurfaceClass,
  modalBodyClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalDescriptionClass,
  modalFooterClass,
  modalHeaderRowClass,
  modalTitleClass,
  TagDot,
} from 'common.ui';
import type { LibraryTag } from './libraryTagsStore';
import { TagFormModal } from './TagFormModal';

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

type TagManageModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TagManageModal = ({ open, onOpenChange }: TagManageModalProps) => {
  const { t } = useTranslation('materials');
  const { tags, deleteTag, canCreateMore, canManageTag, isLoading } = useLibraryTags();
  const [editingTag, setEditingTag] = useState<LibraryTag | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingTag, setDeletingTag] = useState<LibraryTag | null>(null);
  const [search, setSearch] = useState('');
  const formOpen = createOpen || editingTag != null;

  useEffect(() => cleanupBodyScrollLock, []);

  useEffect(() => {
    if (open) {
      return;
    }

    setCreateOpen(false);
    setEditingTag(null);
    setDeletingTag(null);
    setSearch('');
  }, [open]);

  const handleClose = () => {
    if (formOpen || deletingTag) {
      return;
    }

    onOpenChange(false);
    cleanupBodyScrollLock();
  };

  const visibleTags = useMemo(() => filterGenericTags(tags, search), [search, tags]);

  return (
    <>
      <Modal
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            handleClose();
            return;
          }

          onOpenChange(next);
        }}
      >
        <ModalContent
          className={modalContentClass}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            cleanupBodyScrollLock();
          }}
          onPointerDownOutside={(event) => {
            if (formOpen || deletingTag) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            const target = event.target as HTMLElement | null;
            if (
              formOpen ||
              deletingTag ||
              target?.closest('[data-radix-dropdown-menu-content]') ||
              target?.closest('[role="menu"]')
            ) {
              event.preventDefault();
            }
          }}
        >
          <div className={modalBodyClass}>
            <div className={`${modalHeaderRowClass} items-start`}>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <ModalTitle className={modalTitleClass}>{t('files.tagManage.title')}</ModalTitle>
                <ModalDescription className={modalDescriptionClass}>
                  {t('files.tagManage.description')}
                </ModalDescription>
              </div>
              <ModalCloseIcon onClick={handleClose} aria-label={t('files.tagManage.close')} />
            </div>

            <div className="border-border-control flex h-9 w-full items-center gap-1 rounded-xl border px-2">
              <Search className="fill-icon-secondary size-4 shrink-0" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('files.tags.searchPlaceholder')}
                className="text-s-base text-text-primary placeholder:text-text-secondary min-w-0 flex-1 bg-transparent leading-5 outline-none"
              />
            </div>

            <div className="flex max-h-80 min-h-16 flex-col overflow-y-auto">
              {tags.length === 0 && !search.trim() ? (
                <p className="text-s-base text-text-secondary py-6 text-center">
                  {isLoading ? t('files.tags.loading') : t('files.tagManage.empty')}
                </p>
              ) : visibleTags.length === 0 ? (
                <p className="text-s-base text-text-secondary py-6 text-center">
                  {isLoading ? t('files.tags.loading') : t('files.tags.empty')}
                </p>
              ) : (
                visibleTags.map((tag) => {
                  const canManage = canManageTag(tag);
                  return (
                    <div
                      key={tag.id}
                      className="border-border-default flex h-12 shrink-0 items-center gap-3 border-b last:border-b-0"
                    >
                      <TagDot color={tag.color} />
                      <p className="text-text-primary min-w-0 flex-1 truncate text-base leading-5">
                        {tag.name}
                      </p>
                      {canManage ? (
                        <DropdownMenu modal>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="none"
                              size="icon"
                              className="hover:bg-background-subtle size-8 rounded-lg p-0"
                              aria-label={t('files.tagManage.actions')}
                              data-umami-event="materials-tag-menu-open"
                            >
                              <MoreVert className={cardMenuIconClass} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="bottom"
                            align="end"
                            className={cn(cardMenuSurfaceClass, 'text-text-primary z-100')}
                            onCloseAutoFocus={(event) => event.preventDefault()}
                          >
                            <DropdownMenuItem
                              className={cardMenuItemClass}
                              onClick={() => setEditingTag(tag)}
                              data-umami-event="materials-tag-edit"
                            >
                              <Edit />
                              {t('files.tagManage.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className={cardMenuSeparatorClass} />
                            <DropdownMenuItem
                              error
                              className={cardMenuDeleteItemClass}
                              onClick={() => setDeletingTag(tag)}
                              data-umami-event="materials-tag-delete"
                            >
                              <Trash />
                              {t('files.tagManage.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>

            <div className={modalFooterClass}>
              <Button
                type="button"
                variant="primary"
                size="m"
                className={modalConfirmButtonClass}
                disabled={!canCreateMore}
                onClick={() => setCreateOpen(true)}
                data-umami-event="materials-tag-create-open"
              >
                {t('files.tagManage.create')}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      <TagFormModal
        open={createOpen}
        onOpenChange={(next) => {
          setCreateOpen(next);
          if (!next) {
            cleanupBodyScrollLock();
          }
        }}
      />

      <TagFormModal
        tag={editingTag}
        open={editingTag != null}
        onOpenChange={(next) => {
          if (!next) {
            setEditingTag(null);
            cleanupBodyScrollLock();
          }
        }}
      />

      <ConfirmDialog
        open={deletingTag != null}
        onOpenChange={(next) => {
          if (!next) {
            setDeletingTag(null);
          }
        }}
        title={t('files.tagDelete.title', { name: deletingTag?.name ?? '' })}
        description={t('files.tagDelete.description')}
        confirmLabel={t('files.tagDelete.confirm')}
        cancelLabel={t('files.tagDelete.cancel')}
        onConfirm={() => {
          if (deletingTag) {
            void deleteTag(deletingTag.id);
          }
        }}
      />
    </>
  );
};
