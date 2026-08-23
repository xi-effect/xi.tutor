import { Badge } from '@xipkg/badge';
import { Button } from '@xipkg/button';
import { Edit, InfoCircle } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useEditor } from '@ibodr/draw';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { hasCheckableAnswers } from '../primitives/evaluate';
import type { ActivityKind } from '../model/kinds';
import type { ActivityDefinition, CheckStatus, ValidationResult } from '../model/types';
import { ACTIVITY_KIND_ICONS } from './activityKindIcons';
import { boardIconClass } from '../../ui/boardTheme';

export function ActivityHeader({
  kind,
  title,
  canRename,
  onTitleChange,
  isEditing,
  checkStatus,
  score,
  definition,
}: {
  kind: ActivityKind;
  title?: string;
  canRename: boolean;
  onTitleChange: (title: string) => void;
  isEditing: boolean;
  checkStatus: CheckStatus;
  score: ValidationResult;
  definition: ActivityDefinition;
}) {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draft, setDraft] = useState('');
  const Icon = kind ? ACTIVITY_KIND_ICONS[kind] : undefined;
  const fallback = kind ? t(`activity.kinds.${kind}`) : '';
  const displayTitle = (title ?? '').trim() || fallback;
  const checkable = hasCheckableAnswers(definition);
  const showScore = !isEditing && checkStatus !== 'idle' && checkable;
  const emptyDraft = isRenaming && !draft.trim();

  const stop = (event: PointerEvent | KeyboardEvent) => {
    editor.markEventAsHandled(event);
    event.stopPropagation();
  };

  const startRenaming = () => {
    if (!canRename) return;
    setDraft(displayTitle);
    setIsRenaming(true);
  };

  const cancelRenaming = () => {
    setDraft(displayTitle);
    setIsRenaming(false);
  };

  const submitRenaming = () => {
    const next = draft.trim();
    if (!next) {
      cancelRenaming();
      return;
    }
    if (next !== displayTitle) onTitleChange(next);
    setIsRenaming(false);
  };

  useEffect(() => {
    if (!isRenaming) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isRenaming]);

  return (
    <div className="group flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5">
      <span className="flex size-8 shrink-0 items-center justify-center">
        {Icon ? <Icon className={cn('size-5', boardIconClass)} /> : null}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {isRenaming ? (
          <div
            className={cn(
              'relative flex min-w-0 flex-1 items-center rounded-lg border-2 py-0.5',
              emptyDraft ? 'border-border-error' : 'border-border-focus',
            )}
          >
            <input
              ref={inputRef}
              value={draft}
              data-board-control=""
              autoComplete="off"
              aria-label={t('activity.renameAria')}
              aria-invalid={emptyDraft}
              placeholder={t('activity.renamePlaceholder')}
              className="text-text-primary caret-brand-80 h-6 min-w-0 flex-1 bg-transparent px-1.5 text-sm font-medium outline-none"
              onPointerDown={stop}
              onKeyDown={(event) => {
                stop(event);
                if (event.key === 'Enter') {
                  event.preventDefault();
                  submitRenaming();
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  cancelRenaming();
                }
              }}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={submitRenaming}
            />
            {emptyDraft ? (
              <div className="text-red-80 bg-red-0 absolute top-8 left-0 z-10 flex max-w-full items-center gap-1 rounded-sm p-1">
                <InfoCircle className="size-4 shrink-0" />
                <p className="text-xs">{t('activity.renameEmpty')}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <button
              type="button"
              data-board-control=""
              disabled={!canRename}
              title={displayTitle}
              className={cn(
                'text-text-primary min-w-0 truncate bg-transparent p-0 text-left text-sm font-medium',
                canRename && 'cursor-pointer',
              )}
              onPointerDown={stop}
              onClick={startRenaming}
            >
              {displayTitle}
            </button>
            {canRename ? (
              <Button
                type="button"
                variant="none"
                data-board-control=""
                className="hover:bg-status-info-background size-6 shrink-0 rounded-md p-0 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
                onPointerDown={stop}
                onClick={startRenaming}
                aria-label={t('activity.renameAria')}
              >
                <Edit className={cn('size-4', boardIconClass)} />
              </Button>
            ) : null}
          </>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isEditing ? 'edit' : 'play'}
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.16 }}
            className="inline-flex shrink-0"
          >
            <Badge size="s" variant={isEditing ? 'default' : 'secondary'} className="shrink-0">
              {isEditing ? t('activity.modeEdit') : t('activity.modePlay')}
            </Badge>
          </motion.span>
        </AnimatePresence>
      </div>
      {showScore ? (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex shrink-0"
        >
          <Badge
            size="s"
            variant={score.correct === score.total ? 'success' : 'secondary'}
            className="shrink-0 tabular-nums"
          >
            {score.correct} / {score.total}
          </Badge>
        </motion.span>
      ) : null}
    </div>
  );
}

export { ActivityHeader as ActivityChrome };
