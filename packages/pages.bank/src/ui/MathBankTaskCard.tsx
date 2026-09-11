import { Button } from '@xipkg/button';
import { Task } from '@xipkg/icons';
import { cardTypeIconBoxClass } from 'common.ui';
import type { ExamKind, MathTaskSearchDocument } from 'features.math.bank';
import { useTranslation } from 'react-i18next';
import { formatExamBadge, pickVisibleExamMappings } from '../utils/exam';
import { DIFFICULTY_GROUP_VALUES, type MathDifficultyGroup } from '../types';
import { FavoriteHeart } from './FavoriteHeart';
import { BankStatement } from './BankStatement';

const difficultyGroupOf = (difficulty: number): MathDifficultyGroup => {
  if (DIFFICULTY_GROUP_VALUES.advanced.includes(difficulty)) {
    return 'advanced';
  }
  if (DIFFICULTY_GROUP_VALUES.medium.includes(difficulty)) {
    return 'medium';
  }
  return 'basic';
};

type MathBankTaskCardProps = {
  task: MathTaskSearchDocument;
  isFavorite: boolean;
  onOpen: (task: MathTaskSearchDocument) => void;
  onToggleFavorite: (taskId: string) => void;
};

export const MathBankTaskCard = ({
  task,
  isFavorite,
  onOpen,
  onToggleFavorite,
}: MathBankTaskCardProps) => {
  const { t } = useTranslation('mathBank');
  const examLabels = {
    OGE: t('filters.exam.OGE'),
    EGE: t('filters.exam.EGE'),
    EGE_BASE: t('filters.exam.EGE_BASE'),
    EGE_PROFILE: t('filters.exam.EGE_PROFILE'),
  } as Record<ExamKind, string>;
  const badges = pickVisibleExamMappings(task.examMappings);

  return (
    <div
      role="button"
      tabIndex={0}
      className="group bg-background-surface relative flex h-52 min-h-52 w-full min-w-0 shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-linear hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.1)]"
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(task);
        }
      }}
      data-umami-event="math-bank-task-open"
      data-umami-event-task={task.id}
    >
      <div className="flex w-full min-w-0 shrink-0 items-center gap-2">
        <div className={cardTypeIconBoxClass}>
          <Task className="fill-icon-primary size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-s-base text-text-primary truncate font-medium">{task.topic}</p>
          <p className="text-xs-base text-text-secondary truncate">
            {t('card.grade', { grade: task.grade })} ·{' '}
            {t(`filters.difficulty.${difficultyGroupOf(task.difficulty)}`)}
          </p>
        </div>
        <Button
          type="button"
          variant="none"
          size="icon"
          className="hover:bg-background-subtle size-9 shrink-0 rounded-lg p-0"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(task.id);
          }}
          aria-label={isFavorite ? t('card.favoriteRemove') : t('card.favoriteAdd')}
          data-umami-event="math-bank-task-favorite-toggle"
        >
          <FavoriteHeart active={isFavorite} className="size-5" />
        </Button>
      </div>

      <p className="text-s-base text-text-primary mt-3 line-clamp-3 min-h-0 flex-1 leading-5">
        <BankStatement text={task.statement} subject={task.subject} />
      </p>

      {badges.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {badges.map((mapping) => {
            const badge = formatExamBadge(mapping, examLabels);
            return (
              <span
                key={`${mapping.exam}-${mapping.year}-${badge.number}-${mapping.relation}`}
                className="bg-status-info-background text-xs-base text-text-secondary rounded-lg px-2 py-1"
              >
                {t(`examBadge.${mapping.relation}`, {
                  exam: badge.exam,
                  year: badge.year,
                  number: badge.number,
                })}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
