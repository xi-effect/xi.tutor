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
import type { HomeworkQuestion, HomeworkQuestionType } from '../types';
import { AddQuestionMenu } from './AddQuestionMenu';
import { QuestionCard } from './QuestionCard';

type QuestionListProps = {
  questions: HomeworkQuestion[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (question: HomeworkQuestion) => void;
  onAdd: (type: HomeworkQuestionType) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onReorderOption: (questionId: string, activeOptionId: string, overOptionId: string) => void;
};

const collisionDetection: CollisionDetection = (args) => {
  const activeId = String(args.active.id);
  const optionDrag = activeId.startsWith('option:');
  return closestCenter({
    ...args,
    droppableContainers: args.droppableContainers.filter((container) => {
      const id = String(container.id);
      return optionDrag ? id.startsWith('option:') : !id.startsWith('option:');
    }),
  });
};

export const QuestionList = ({
  questions,
  activeId,
  onSelect,
  onChange,
  onAdd,
  onDuplicate,
  onDelete,
  onReorder,
  onReorderOption,
}: QuestionListProps) => {
  const { t } = useTranslation('homeworkEditor');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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
    onReorder(String(active.id), String(over.id));
  };

  return (
    <section className="flex flex-col gap-3">
      {questions.length === 0 ? (
        <p className="text-text-secondary px-4 py-6 text-center text-sm">{t('emptyQuestions')}</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={questions.map((question) => question.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  expanded={question.id === activeId}
                  onSelect={() => onSelect(question.id === activeId ? null : question.id)}
                  onChange={onChange}
                  onDuplicate={() => onDuplicate(question.id)}
                  onDelete={() => onDelete(question.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <AddQuestionMenu onAdd={onAdd} />
    </section>
  );
};
