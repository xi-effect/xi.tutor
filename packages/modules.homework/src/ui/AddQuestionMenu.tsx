import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { QUESTION_TYPES, type HomeworkQuestionType } from '../types';
import { QUESTION_TYPE_ICONS } from './questionTypeIcons';

type AddQuestionMenuProps = {
  onAdd: (type: HomeworkQuestionType) => void;
};

export const AddQuestionMenu = ({ onAdd }: AddQuestionMenuProps) => {
  const { t } = useTranslation('homeworkEditor');

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {QUESTION_TYPES.map((type) => {
        const Icon = QUESTION_TYPE_ICONS[type];
        return (
          <button
            key={type}
            type="button"
            className={cn(
              'border-border-control bg-background-surface text-text-primary inline-flex h-9 max-w-full items-center gap-1.5 rounded-full border px-3 text-sm font-medium',
              'hover:border-border-focus focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
            )}
            onClick={() => onAdd(type)}
            data-umami-event="homework-add-question"
          >
            <Icon theme="muted" size="sm" />
            <span className="truncate">{t(`types.${type}`)}</span>
          </button>
        );
      })}
    </div>
  );
};
