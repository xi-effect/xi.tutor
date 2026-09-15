import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Edit, MoreVert, Search, Trash } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { filterGenericTags, useLibraryTags } from 'common.services';
import {
  ConfirmDialog,
  cardMenuDeleteItemClass,
  cardMenuIconClass,
  cardMenuItemClass,
  cardMenuSeparatorClass,
  cardMenuSurfaceClass,
  TagDot,
} from 'common.ui';
import type { LibraryTag } from './libraryTagsStore';
import { TagFormModal } from './TagFormModal';

export const Tags = () => {
  const { t } = useTranslation('profile');
  const { tags, deleteTag, canCreateMore, canManageTag, isLoading } = useLibraryTags();
  const [editingTag, setEditingTag] = useState<LibraryTag | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingTag, setDeletingTag] = useState<LibraryTag | null>(null);
  const [search, setSearch] = useState('');

  const visibleTags = useMemo(() => filterGenericTags(tags, search), [search, tags]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-col gap-1">
        <h2 className="dark:text-text-primary mb-4 text-3xl font-semibold">
          {t('tags.tagManage.title')}
        </h2>
      </div>

      <div className="border-border-control flex h-full flex-col gap-4 overflow-hidden rounded-2xl border p-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('tags.searchPlaceholder')}
          before={<Search />}
        />

        <div className="flex min-h-16 flex-col overflow-auto">
          {tags.length === 0 && !search.trim() ? (
            <p className="text-s-base text-text-secondary py-6 text-center">
              {isLoading ? t('tags.loading') : t('tags.tagManage.empty')}
            </p>
          ) : visibleTags.length === 0 ? (
            <p className="text-s-base text-text-secondary py-6 text-center">
              {isLoading ? t('tags.loading') : t('tags.empty')}
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
                    <DropdownMenu modal={true}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="none"
                          size="icon"
                          className="hover:bg-background-subtle size-8 rounded-lg p-0"
                          aria-label={t('tags.tagManage.actions')}
                          data-umami-event="materials-tag-menu-open"
                        >
                          <MoreVert className={cardMenuIconClass} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="bottom"
                        align="end"
                        className={cn(cardMenuSurfaceClass, 'text-text-primary z-100')}
                      >
                        <DropdownMenuItem
                          className={cardMenuItemClass}
                          onClick={() => setEditingTag(tag)}
                          data-umami-event="materials-tag-edit"
                        >
                          <Edit />
                          {t('tags.tagManage.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className={cardMenuSeparatorClass} />
                        <DropdownMenuItem
                          error
                          className={cardMenuDeleteItemClass}
                          onClick={() => setDeletingTag(tag)}
                          data-umami-event="materials-tag-delete"
                        >
                          <Trash />
                          {t('tags.tagManage.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-auto">
          <Button
            type="button"
            variant="primary"
            size="m"
            disabled={!canCreateMore}
            onClick={() => setCreateOpen(true)}
            data-umami-event="materials-tag-create-open"
            className="w-full"
          >
            {t('tags.tagManage.create')}
          </Button>
        </div>
      </div>

      <TagFormModal open={createOpen} onOpenChange={setCreateOpen} />

      <TagFormModal
        tag={editingTag}
        open={editingTag != null}
        onOpenChange={(next) => {
          if (!next) setEditingTag(null);
        }}
      />

      <ConfirmDialog
        open={deletingTag != null}
        onOpenChange={(next) => {
          if (!next) setDeletingTag(null);
        }}
        title={t('tags.tagDelete.title', { name: deletingTag?.name ?? '' })}
        description={t('tags.tagDelete.description')}
        confirmLabel={t('tags.tagDelete.confirm')}
        cancelLabel={t('tags.tagDelete.cancel')}
        onConfirm={() => {
          if (deletingTag) void deleteTag(deletingTag.id);
        }}
      />
    </div>
  );
};
