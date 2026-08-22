import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import type { ActivityKind } from '../model/kinds';
import type { CheckStatus } from '../model/types';
import { hasCheckableAnswers } from '../primitives/evaluate';
import type { ActivityDefinition, ValidationResult } from '../model/types';

const chromeButtonClass =
  'hover:bg-status-info-background pointer-events-auto h-6 shrink-0 rounded-lg px-2 text-xs';

export function ActivityChrome({
  kind,
  title,
  canEdit,
  isEditing,
  checkStatus,
  score,
  definition,
  onEdit,
  onCheck,
  onReset,
  onReveal,
}: {
  kind: ActivityKind;
  title: string;
  canEdit: boolean;
  isEditing: boolean;
  checkStatus: CheckStatus;
  score: ValidationResult;
  definition: ActivityDefinition;
  onEdit: () => void;
  onCheck: () => void;
  onReset: () => void;
  onReveal: () => void;
}) {
  const { t } = useTranslation('board');
  const checkable = hasCheckableAnswers(definition);
  const showScore = checkStatus !== 'idle' && checkable;

  return (
    <div className="border-border-default flex shrink-0 items-center gap-1 border-b px-2 py-1">
      <span className="text-text-primary min-w-0 flex-1 truncate text-xs font-medium">{title}</span>
      {showScore && (
        <span className="text-text-secondary shrink-0 text-xs tabular-nums">
          {score.correct} / {score.total}
        </span>
      )}
      {canEdit && (
        <Button
          variant="none"
          size="s"
          className={chromeButtonClass}
          onClick={onEdit}
          data-board-control=""
          style={{ pointerEvents: 'auto' }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {isEditing ? t('activity.play') : t('activity.edit')}
        </Button>
      )}
      {!isEditing && checkable && (
        <Button
          variant="none"
          size="s"
          className={chromeButtonClass}
          onClick={onCheck}
          data-board-control=""
          style={{ pointerEvents: 'auto' }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {t('activity.check')}
        </Button>
      )}
      {!isEditing && (
        <Button
          variant="none"
          size="s"
          className={chromeButtonClass}
          onClick={onReset}
          data-board-control=""
          style={{ pointerEvents: 'auto' }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {t('activity.reset')}
        </Button>
      )}
      {!isEditing && kind !== 'random-card' && (
        <Button
          variant="none"
          size="s"
          className={chromeButtonClass}
          onClick={onReveal}
          data-board-control=""
          style={{ pointerEvents: 'auto' }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {t('activity.reveal')}
        </Button>
      )}
    </div>
  );
}
