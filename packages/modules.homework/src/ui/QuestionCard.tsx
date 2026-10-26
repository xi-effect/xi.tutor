import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Check, Copy, MoreVert, Move, Trash } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { Toggle } from '@xipkg/toggle';
import { cn } from '@xipkg/utils';
import {
  cardMaterialMenuButtonClass,
  cardMenuIconClass,
  cardMenuItemClass,
  cardMenuSubTriggerClass,
  cardMenuSurfaceClass,
} from 'common.ui';
import { useTranslation } from 'react-i18next';
import { optionDragId } from '../dragIds';
import { promptPlainText, toggleOptionCorrect, withQuestionType } from '../model';
import { QUESTION_TYPES, isChoiceQuestionType, type HomeworkQuestion } from '../types';
import { OptionList } from './OptionList';
import { QuestionPromptEditor } from './QuestionPromptEditor';
import { QUESTION_TYPE_ICONS } from './questionTypeIcons';

type QuestionCardProps = {
  question: HomeworkQuestion;
  index: number;
  expanded: boolean;
  onSelect: () => void;
  onChange: (question: HomeworkQuestion) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export const QuestionCard = ({
  question,
  index,
  expanded,
  onSelect,
  onChange,
  onDuplicate,
  onDelete,
}: QuestionCardProps) => {
  const { t } = useTranslation('homeworkEditor');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });
  const plain = promptPlainText(question.promptHtml);
  const choice = isChoiceQuestionType(question.type);
  const hasCorrectAnswer = question.type === 'short_text' || question.type === 'number';
  const TypeIcon = QUESTION_TYPE_ICONS[question.type];

  const moveOption = (optionId: string, direction: -1 | 1) => {
    const from = question.options.findIndex((option) => option.id === optionId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= question.options.length) return;
    const options = question.options.slice();
    const [item] = options.splice(from, 1);
    if (!item) return;
    options.splice(to, 0, item);
    onChange({ ...question, options });
  };

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'z-10 opacity-80')}
    >
      <div className="flex items-center gap-1 px-2 py-2">
        <button
          type="button"
          className="text-icon-secondary flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg bg-transparent"
          aria-label={t('drag')}
          {...attributes}
          {...listeners}
        >
          <Move className="size-4" />
        </button>
        <button
          type="button"
          className="hover:bg-background-subtle flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-transparent py-1 text-left"
          onClick={onSelect}
        >
          <span className="text-text-secondary w-5 shrink-0 text-sm">{index + 1}</span>
          <span
            className={cn(
              'text-text-primary min-w-0 flex-1 text-sm',
              expanded ? 'font-medium' : 'truncate',
            )}
          >
            {plain || t('emptyPrompt')}
          </span>
          <span className="text-text-secondary hidden min-w-0 truncate text-xs sm:inline">
            {t(`types.${question.type}`)}
            {question.required ? ' *' : ''}
          </span>
        </button>
      </div>

      {expanded ? (
        <div className="flex flex-col gap-4 px-4 pb-4">
          <QuestionPromptEditor
            key={question.id}
            value={question.promptHtml}
            onChange={(promptHtml) => onChange({ ...question, promptHtml })}
          />

          {choice ? (
            <SortableContext
              items={question.options.map((option) => optionDragId(question.id, option.id))}
              strategy={verticalListSortingStrategy}
            >
              <OptionList
                questionId={question.id}
                options={question.options}
                onChange={(optionId, text) =>
                  onChange({
                    ...question,
                    options: question.options.map((option) =>
                      option.id === optionId ? { ...option, text } : option,
                    ),
                  })
                }
                onToggleCorrect={(optionId) => onChange(toggleOptionCorrect(question, optionId))}
                onRemove={(optionId) =>
                  onChange({
                    ...question,
                    options: question.options.filter((option) => option.id !== optionId),
                  })
                }
                onMove={moveOption}
                onAdd={() =>
                  onChange({
                    ...question,
                    options: [
                      ...question.options,
                      { id: crypto.randomUUID(), text: '', isCorrect: false },
                    ],
                  })
                }
              />
            </SortableContext>
          ) : null}

          {hasCorrectAnswer ? (
            <label className="flex flex-col gap-1.5">
              <span className="text-text-secondary text-xs">{t('correctAnswer')}</span>
              <Input
                value={question.correctAnswer}
                variant="s"
                type={question.type === 'number' ? 'number' : 'text'}
                placeholder={t('correctAnswerPlaceholder')}
                onChange={(event) => onChange({ ...question, correctAnswer: event.target.value })}
              />
            </label>
          ) : null}

          {question.type === 'file' ? (
            <p className="text-text-secondary text-sm">{t('fileHint')}</p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-3">
              <Toggle
                checked={question.required}
                size="s"
                aria-label={t('required')}
                onCheckedChange={(checked) => onChange({ ...question, required: checked === true })}
              />
              <span className="text-text-primary text-sm">{t('required')}</span>
            </label>
            <div className="flex items-center gap-1">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="none"
                    size="icon"
                    className={cardMaterialMenuButtonClass}
                    aria-label={t('more')}
                  >
                    <MoreVert className={cardMenuIconClass} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  align="end"
                  className={cn(cardMenuSurfaceClass, 'text-text-primary')}
                >
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className={cardMenuSubTriggerClass}>
                      <TypeIcon />
                      <span className="min-w-0 flex-1 truncate">{t('questionType')}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent
                      className={cn(cardMenuSurfaceClass, 'text-text-primary')}
                    >
                      {QUESTION_TYPES.map((type) => {
                        const Icon = QUESTION_TYPE_ICONS[type];
                        return (
                          <DropdownMenuItem
                            key={type}
                            className={cardMenuItemClass}
                            onSelect={() => {
                              if (type === question.type) return;
                              onChange(withQuestionType(question, type));
                            }}
                          >
                            <Icon />
                            <span className="min-w-0 flex-1 truncate">{t(`types.${type}`)}</span>
                            {type === question.type ? <Check className="ml-auto" /> : null}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem className={cardMenuItemClass} onSelect={onDuplicate}>
                    <Copy />
                    {t('duplicate')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                type="button"
                variant="none"
                size="icon"
                className="size-9"
                aria-label={t('delete')}
                onClick={onDelete}
              >
                <Trash className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
};
