import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';
import { readOptionDrag } from '../dragIds';
import { questionsByType } from '../model';
import type { HomeworkQuestion, HomeworkQuestionType } from '../types';
import { AddQuestionMenu } from './AddQuestionMenu';
import { AssignmentBody } from './AssignmentBody';
import { QuestionCard } from './QuestionCard';
import { QUESTION_TYPE_ICONS } from './questionTypeIcons';

type QuestionListProps = {
  descriptionHtml: string;
  questions: HomeworkQuestion[];
  onDescription: (html: string) => void;
  onChange: (question: HomeworkQuestion) => void;
  onAdd: (type: HomeworkQuestionType) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onReorderOption: (questionId: string, activeOptionId: string, overOptionId: string) => void;
};

export const QuestionList = ({
  descriptionHtml,
  questions,
  onDescription,
  onChange,
  onAdd,
  onDuplicate,
  onDelete,
  onReorder,
  onReorderOption,
}: QuestionListProps) => {
  const { t } = useTranslation('homeworkEditor');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const groups = questionsByType(questions);
  const typeById = new Map(questions.map((question) => [question.id, question.type]));

  const collisionDetection: CollisionDetection = (args) => {
    const activeId = String(args.active.id);
    const optionDrag = activeId.startsWith('option:');
    const activeType = typeById.get(activeId);
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter((container) => {
        const id = String(container.id);
        if (optionDrag) return id.startsWith('option:');
        if (id.startsWith('option:')) return false;
        return typeById.get(id) === activeType;
      }),
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeDrag = readOptionDrag(String(active.id));
    const overDrag = readOptionDrag(String(over.id));
    if (activeDrag && overDrag && activeDrag.questionId === overDrag.questionId) {
      onReorderOption(activeDrag.questionId, activeDrag.optionId, overDrag.optionId);
      return;
    }
    if (activeDrag || overDrag) return;
    const activeType = typeById.get(String(active.id));
    const overType = typeById.get(String(over.id));
    if (!activeType || activeType !== overType) return;
    onReorder(String(active.id), String(over.id));
  };

  return (
    <section className="flex flex-col gap-8">
      <AssignmentBody value={descriptionHtml} onChange={onDescription} />

      {questions.length === 0 ? (
        <p className="text-text-secondary px-4 py-6 text-center text-sm">{t('emptyQuestions')}</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEnd}
        >
          <div className="flex flex-col gap-8">
            {groups.map((group) => {
              const Icon = QUESTION_TYPE_ICONS[group.type];
              return (
                <div key={group.type} className="flex flex-col gap-2">
                  <div className="text-text-secondary flex items-center gap-2 pl-10 text-sm">
                    <Icon theme="muted" size="sm" />
                    <span>{t(`types.${group.type}`)}</span>
                  </div>
                  <SortableContext
                    items={group.items.map((question) => question.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-3">
                      {group.items.map((question) => (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          onChange={onChange}
                          onDuplicate={() => onDuplicate(question.id)}
                          onDelete={() => onDelete(question.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
        </DndContext>
      )}
      <AddQuestionMenu onAdd={onAdd} />
    </section>
  );
};
