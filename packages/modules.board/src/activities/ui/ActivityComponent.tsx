import { HTMLContainer } from '@ibodr/draw';
import { useCurrentUser } from 'common.services';
import { useTranslation } from 'react-i18next';
import { useYjsContext } from '../../providers/YjsProvider';
import type { ActivityShape } from '../shape/ActivityShape';
import { useActivityEditStore } from '../store/activityEditStore';
import { useActivityController } from './useActivityController';
import { ActivityChrome } from './ActivityChrome';
import { TokenDndProvider } from './TokenDnd';
import { GapTextActivity } from './kinds/GapTextActivity';
import { MatchingActivity } from './kinds/MatchingActivity';
import { SortingActivity } from './kinds/SortingActivity';
import { OrderingActivity } from './kinds/OrderingActivity';
import { LabelImageActivity } from './kinds/LabelImageActivity';
import { MultipleChoiceActivity } from './kinds/MultipleChoiceActivity';
import { MysteryTilesActivity } from './kinds/MysteryTilesActivity';
import { RandomCardActivity } from './kinds/RandomCardActivity';
import type { ActivityDefinition } from '../model/types';

export function ActivityComponent({ shape }: { shape: ActivityShape }) {
  const { t } = useTranslation('board');
  const { isReadonly } = useYjsContext();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const canEdit = Boolean(isTutor && !isReadonly);
  const isEditing = useActivityEditStore((state) => Boolean(state.editingIds[shape.id]));
  const toggleEditing = useActivityEditStore((state) => state.toggleEditing);
  const { setDefinition, setAttempt, check, reset, reveal, score } = useActivityController(shape);
  const definition = shape.props.definition;
  const mode = canEdit && isEditing ? 'edit' : 'play';

  const onDefinition = (next: ActivityDefinition) => setDefinition(next);

  return (
    <HTMLContainer
      className="bg-background-surface border-border-default flex flex-col overflow-hidden rounded-xl border shadow-md"
      data-board-interactive-card=""
      style={{ width: shape.props.w, height: shape.props.h, pointerEvents: 'none' }}
    >
      <ActivityChrome
        kind={shape.props.kind}
        title={t(`activity.kinds.${shape.props.kind}`)}
        canEdit={canEdit}
        isEditing={isEditing}
        checkStatus={shape.props.checkStatus}
        score={score}
        definition={definition}
        onEdit={() => toggleEditing(shape.id)}
        onCheck={check}
        onReset={reset}
        onReveal={reveal}
      />
      <div
        className="min-h-0 flex-1 overflow-auto"
        data-board-control=""
        style={{ pointerEvents: 'auto' }}
        onPointerDown={(event) => event.stopPropagation()}
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
              onAttempt={setAttempt}
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
              onAttempt={setAttempt}
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
              onAttempt={setAttempt}
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
              onAttempt={setAttempt}
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
              onAttempt={setAttempt}
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
              onAttempt={setAttempt}
            />
          )}
          {definition.kind === 'mystery-tiles' && (
            <MysteryTilesActivity
              definition={definition}
              attempt={shape.props.attempt}
              checkStatus={shape.props.checkStatus}
              mode={mode}
              onDefinition={onDefinition}
              onAttempt={setAttempt}
            />
          )}
          {definition.kind === 'random-card' && (
            <RandomCardActivity
              definition={definition}
              attempt={shape.props.attempt}
              checkStatus={shape.props.checkStatus}
              mode={mode}
              onDefinition={onDefinition}
              onAttempt={setAttempt}
            />
          )}
        </TokenDndProvider>
      </div>
    </HTMLContainer>
  );
}
