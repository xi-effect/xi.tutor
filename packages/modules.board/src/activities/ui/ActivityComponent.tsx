import { HTMLContainer } from '@ibodr/draw';
import { useCurrentUser } from 'common.services';
import { cn } from '@xipkg/utils';
import { useYjsContext } from '../../providers/YjsProvider';
import type { ActivityShape } from '../shape/ActivityShape';
import { useActivityEditStore } from '../store/activityEditStore';
import { normalizeStudentAccess } from '../model/studentAccess';
import type { ActivityDefinition } from '../model/types';
import { ActivityHeader } from './ActivityChrome';
import { useActivityController } from './useActivityController';
import { useActivityAutoSize } from './useActivityAutoSize';
import { ActivityBody } from './ActivityBody';
import { ActivitySessionProvider, BoardActivityCanvas } from './activityHost';

export function ActivityComponent({ shape }: { shape: ActivityShape }) {
  const { isReadonly, token } = useYjsContext();
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
      <BoardActivityCanvas>
        <ActivitySessionProvider token={token}>
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
            <div className="min-h-0 min-w-0 flex-1 overflow-visible">
              <ActivityBody
                definition={definition}
                attempt={shape.props.attempt}
                checkStatus={shape.props.checkStatus}
                byItem={score.byItem}
                mode={mode}
                onDefinition={onDefinition}
                onAttempt={onAttempt}
                interactLocked={interactLocked}
              />
            </div>
          </div>
        </ActivitySessionProvider>
      </BoardActivityCanvas>
    </HTMLContainer>
  );
}
