import { HTMLContainer } from '@ibodr/draw';
import { AnimatePresence, motion } from 'motion/react';
import { useCurrentUser } from 'common.services';
import { cn } from '@xipkg/utils';
import { useYjsContext } from '../../providers/YjsProvider';
import type { ActivityShape } from '../shape/ActivityShape';
import { useActivityEditStore } from '../store/activityEditStore';
import { normalizeStudentAccess } from '../model/studentAccess';
import type { ActivityDefinition } from '../model/types';
import { ActivityHeader } from './ActivityChrome';
import { TokenDndProvider } from './TokenDnd';
import { useActivityController } from './useActivityController';
import { useActivityAutoSize } from './useActivityAutoSize';
import { GapTextActivity } from './kinds/GapTextActivity';
import { MatchingActivity } from './kinds/MatchingActivity';
import { SortingActivity } from './kinds/SortingActivity';
import { OrderingActivity } from './kinds/OrderingActivity';
import { LabelImageActivity } from './kinds/LabelImageActivity';
import { MultipleChoiceActivity } from './kinds/MultipleChoiceActivity';
import { MysteryTilesActivity } from './kinds/MysteryTilesActivity';
import { RandomCardActivity } from './kinds/RandomCardActivity';

export function ActivityComponent({ shape }: { shape: ActivityShape }) {
  const { isReadonly } = useYjsContext();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const canEdit = Boolean(isTutor && !isReadonly);
  const isEditing = useActivityEditStore((state) => Boolean(state.editingIds[shape.id]));
  const { patch, setDefinition, setAttempt, score } = useActivityController(shape);
  const definition = shape.props.definition;
  const mode = canEdit && isEditing ? 'edit' : 'play';
  const studentAccess = normalizeStudentAccess(shape.props.studentAccess);
  const interactLocked = mode === 'play' && !isTutor && !studentAccess.canInteract;
  const measureRef = useActivityAutoSize(shape);

  const onDefinition = (next: ActivityDefinition) => setDefinition(next);
  const onAttempt = interactLocked ? () => undefined : setAttempt;

  return (
    <HTMLContainer
      className="overflow-visible"
      data-board-interactive-card=""
      style={{ width: shape.props.w, height: shape.props.h, pointerEvents: 'none' }}
    >
      <div ref={measureRef} className="flex h-full w-full min-w-0 flex-col gap-2">
        <div
          className={cn(
            'border-border-default bg-background-surface flex shrink-0 rounded-xl border shadow-md',
            isEditing && 'ring-brand-80/40 ring-2',
          )}
        >
          <ActivityHeader
            kind={shape.props.kind}
            title={shape.props.title ?? ''}
            canRename={canEdit}
            onTitleChange={(title) => patch({ title })}
            isEditing={isEditing}
            checkStatus={shape.props.checkStatus}
            score={score}
            definition={definition}
          />
        </div>
        <div
          className="min-h-0 min-w-0 flex-1 overflow-visible"
          data-board-control=""
          style={{ pointerEvents: 'auto' }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${definition.kind}-${mode}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <TokenDndProvider>
                {definition.kind === 'gap-text' && (
                  <GapTextActivity
                    definition={definition}
                    attempt={shape.props.attempt}
                    checkStatus={shape.props.checkStatus}
                    byItem={score.byItem}
                    mode={mode}
                    onDefinition={onDefinition}
                    onAttempt={onAttempt}
                    interactLocked={interactLocked}
                  />
                )}
                {definition.kind === 'matching' && (
                  <MatchingActivity
                    definition={definition}
                    attempt={shape.props.attempt}
                    checkStatus={shape.props.checkStatus}
                    byItem={score.byItem}
                    mode={mode}
                    onDefinition={onDefinition}
                    onAttempt={onAttempt}
                    interactLocked={interactLocked}
                  />
                )}
                {definition.kind === 'sorting' && (
                  <SortingActivity
                    definition={definition}
                    attempt={shape.props.attempt}
                    checkStatus={shape.props.checkStatus}
                    byItem={score.byItem}
                    mode={mode}
                    onDefinition={onDefinition}
                    onAttempt={onAttempt}
                    interactLocked={interactLocked}
                  />
                )}
                {definition.kind === 'ordering' && (
                  <OrderingActivity
                    definition={definition}
                    attempt={shape.props.attempt}
                    checkStatus={shape.props.checkStatus}
                    byItem={score.byItem}
                    mode={mode}
                    onDefinition={onDefinition}
                    onAttempt={onAttempt}
                    interactLocked={interactLocked}
                  />
                )}
                {definition.kind === 'label-image' && (
                  <LabelImageActivity
                    definition={definition}
                    attempt={shape.props.attempt}
                    checkStatus={shape.props.checkStatus}
                    byItem={score.byItem}
                    mode={mode}
                    onDefinition={onDefinition}
                    onAttempt={onAttempt}
                    interactLocked={interactLocked}
                  />
                )}
                {definition.kind === 'multiple-choice' && (
                  <MultipleChoiceActivity
                    definition={definition}
                    attempt={shape.props.attempt}
                    checkStatus={shape.props.checkStatus}
                    byItem={score.byItem}
                    mode={mode}
                    onDefinition={onDefinition}
                    onAttempt={onAttempt}
                    interactLocked={interactLocked}
                  />
                )}
                {definition.kind === 'mystery-tiles' && (
                  <MysteryTilesActivity
                    definition={definition}
                    attempt={shape.props.attempt}
                    checkStatus={shape.props.checkStatus}
                    mode={mode}
                    onDefinition={onDefinition}
                    onAttempt={onAttempt}
                    interactLocked={interactLocked}
                  />
                )}
                {definition.kind === 'random-card' && (
                  <RandomCardActivity
                    definition={definition}
                    attempt={shape.props.attempt}
                    checkStatus={shape.props.checkStatus}
                    mode={mode}
                    onDefinition={onDefinition}
                    onAttempt={onAttempt}
                    interactLocked={interactLocked}
                  />
                )}
              </TokenDndProvider>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </HTMLContainer>
  );
}
