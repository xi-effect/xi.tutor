import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Badge } from '@xipkg/badge';
import { File, TaskFile } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { cardAccessBadgeClass, cardTypeIconBoxClass } from 'common.ui';
import { useHomeworkPresentation } from '../hooks/useHomeworkPresentation';
import { homeworkStatusBadgeClass } from '../status';
import type { HomeworkItem } from '../types';
import { HomeworkActionsMenu } from './HomeworkActionsMenu';
import { HomeworkDetailsModal } from './HomeworkDetailsModal';
import { HomeworkFormModal } from './HomeworkFormModal';

type HomeworkCardProps = {
  item: HomeworkItem;
  className?: string;
  onChange: (id: string, value: { title: string; description: string }) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onCreateFromTemplate: (id: string) => void;
};

export const HomeworkCard = ({
  item,
  className,
  onChange,
  onDuplicate,
  onArchive,
  onRestore,
  onCreateFromTemplate,
}: HomeworkCardProps) => {
  const { t } = useTranslation('homework');
  const { status, description, primaryLine, dateLine } = useHomeworkPresentation(item);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const Icon = item.kind === 'template' ? File : TaskFile;
  const canEdit = item.feed !== 'archive';

  const openDetails = () => {
    if (editOpen) return;
    setDetailsOpen(true);
  };

  const openEdit = () => {
    setDetailsOpen(false);
    window.setTimeout(() => setEditOpen(true), 0);
  };

  return (
    <>
      <div
        onClick={openDetails}
        className={cn(
          'group bg-background-surface relative flex h-44 min-h-44 w-full min-w-0 shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-linear hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.1)]',
          className,
        )}
        data-umami-event="homework-card-open"
        data-umami-event-kind={item.kind}
        data-umami-event-feed={item.feed}
      >
        <div className="flex w-full min-w-0 shrink-0 items-center gap-2">
          <div className={cardTypeIconBoxClass}>
            <Icon />
          </div>

          {status ? (
            <Badge
              variant="default"
              title={t(`status.${status}`)}
              className={cn(
                cardAccessBadgeClass,
                homeworkStatusBadgeClass[status],
                'max-w-[calc(100%-5.5rem)]',
              )}
            >
              {t(`status.${status}`)}
            </Badge>
          ) : null}

          <div
            className="ml-auto flex size-9 shrink-0 items-center justify-center"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <HomeworkActionsMenu
              item={item}
              onOpen={openDetails}
              onEdit={openEdit}
              onDuplicate={() => onDuplicate(item.id)}
              onArchive={() => onArchive(item.id)}
              onRestore={() => onRestore(item.id)}
              onCreateFromTemplate={() => onCreateFromTemplate(item.id)}
            />
          </div>
        </div>

        <p
          className={cn(
            'text-text-primary mt-4 w-full max-w-full min-w-0 shrink-0 overflow-hidden text-base leading-5 font-medium break-words',
            description ? 'line-clamp-1' : 'line-clamp-2',
          )}
          title={item.title}
        >
          {item.title}
        </p>

        {description ? (
          <p className="text-text-secondary mt-1 line-clamp-1 w-full text-xs leading-4 font-normal break-words">
            {description}
          </p>
        ) : null}

        <div className="mt-auto flex w-full min-w-0 flex-col items-start gap-0.5 overflow-hidden pt-2">
          <p
            className="text-text-secondary w-full truncate text-xs leading-4 font-normal"
            title={primaryLine}
          >
            {primaryLine}
          </p>
          <p className="text-text-secondary w-full truncate text-xs leading-4 font-normal">
            {dateLine}
          </p>
        </div>
      </div>

      <HomeworkDetailsModal
        item={item}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onEdit={canEdit ? openEdit : undefined}
      />
      <HomeworkFormModal
        open={editOpen}
        mode="edit"
        kind={item.kind}
        initialTitle={item.title}
        initialDescription={item.description}
        onClose={() => setEditOpen(false)}
        onSubmit={(value) => {
          onChange(item.id, value);
          setEditOpen(false);
          toast(t('toast.saved'));
        }}
      />
    </>
  );
};
