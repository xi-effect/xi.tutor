import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { MoreVert } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { normalizeMultipleChoiceDefinition } from '../model/multipleChoice';
import {
  normalizeStudentAccess,
  type ActivityStudentAccess,
  type ActivityStudentAccessKey,
} from '../model/studentAccess';
import type { ActivityKind } from '../model/kinds';
import type { ActivityAttempt, ActivityDefinition, CheckStatus } from '../model/types';
import { evaluateActivity, hasCheckableAnswers } from '../primitives/evaluate';
import { resetAttempt, revealAttempt } from '../primitives/reset';
import { useActivityEditStore } from '../store/activityEditStore';
import type { ActivityShape } from '../shape/ActivityShape';
import { ActivityHeader } from './ActivityChrome';
import { ActivityBody } from './ActivityBody';
import { ActivitySessionProvider } from './activityHost';
import {
  STUDENT_ACCESS_LABEL_KEYS,
  getActivityKindSettings,
  getActivityMenuActions,
  studentAccessItems,
} from './activityMenuActions';
import {
  boardIconClass,
  boardMenuCheckboxItemClass,
  boardMenuItemClass,
} from '../../ui/boardTheme';

export type ActivityDocumentValue = {
  id: string;
  kind: ActivityKind;
  title: string;
  definition: ActivityDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  studentAccess: ActivityStudentAccess;
};

function asShape(value: ActivityDocumentValue): ActivityShape {
  return { id: value.id, type: 'activity', props: value } as unknown as ActivityShape;
}

function toggleKindSetting(
  definition: ActivityDefinition,
  settingId: string,
): ActivityDefinition | null {
  if (settingId === 'matching-drag' && definition.kind === 'matching') {
    return { ...definition, mode: definition.mode === 'drag' ? 'connect' : 'drag' };
  }
  if (settingId === 'mc-multiple' && definition.kind === 'multiple-choice') {
    return normalizeMultipleChoiceDefinition({ ...definition, multiple: !definition.multiple });
  }
  if (settingId === 'mc-randomize' && definition.kind === 'multiple-choice') {
    return { ...definition, randomize: !definition.randomize };
  }
  if (settingId === 'card-norepeat' && definition.kind === 'random-card') {
    return { ...definition, noRepeat: !definition.noRepeat };
  }
  return null;
}

export function ActivityDocument({
  value,
  token,
  canEdit,
  isTutor,
  onChange,
}: {
  value: ActivityDocumentValue;
  token: string;
  canEdit: boolean;
  isTutor: boolean;
  onChange: (patch: Partial<Omit<ActivityDocumentValue, 'id'>>) => void;
}) {
  const { t } = useTranslation('board');
  const isEditing = useActivityEditStore((state) => Boolean(state.editingIds[value.id]));
  const setEditing = useActivityEditStore((state) => state.setEditing);
  const definition = value.definition;
  const mode = canEdit && isEditing ? 'edit' : 'play';
  const studentAccess = normalizeStudentAccess(value.studentAccess);
  const interactLocked = mode === 'play' && !isTutor && !studentAccess.canInteract;
  const score = evaluateActivity(definition, value.attempt);
  const shape = asShape({ ...value, studentAccess });
  const shapes = [shape];
  const actions = getActivityMenuActions({
    t: (key) => t(key),
    shapes,
    canEdit,
    isTutor,
    allEditing: isEditing,
  });
  const kindSettings = canEdit ? getActivityKindSettings(shapes) : [];
  const accessItems = canEdit ? studentAccessItems(shapes) : [];
  const showMenu = actions.length > 0 || kindSettings.length > 0 || accessItems.length > 0;

  const runAction = (action: (typeof actions)[number]['id']) => {
    if (action === 'edit') {
      const nextEditing = !isEditing;
      setEditing(value.id, nextEditing);
      if (!nextEditing && definition.kind === 'multiple-choice') {
        const normalized = normalizeMultipleChoiceDefinition(definition);
        if (normalized !== definition) onChange({ definition: normalized, kind: normalized.kind });
      }
      return;
    }
    if (action === 'check' && hasCheckableAnswers(definition)) {
      onChange({ checkStatus: 'checked' });
      return;
    }
    if (action === 'reset') {
      onChange({ attempt: resetAttempt(definition), checkStatus: 'idle' });
      return;
    }
    if (action === 'reveal' && value.kind !== 'random-card') {
      onChange({
        attempt: revealAttempt(definition, value.attempt),
        checkStatus: 'revealed',
      });
    }
  };

  return (
    <ActivitySessionProvider token={token}>
      <div className="flex w-full min-w-0 flex-col gap-2">
        <div
          className={cn(
            'border-border-default bg-background-surface flex w-full shrink-0 rounded-xl border shadow-md',
            isEditing && 'ring-brand-80/40 ring-2',
          )}
        >
          <ActivityHeader
            kind={value.kind}
            title={value.title}
            canRename={canEdit}
            onTitleChange={(title) => onChange({ title })}
            isEditing={isEditing}
            checkStatus={value.checkStatus}
            score={score}
            definition={definition}
            trailing={
              showMenu ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="none"
                      data-board-control=""
                      className="hover:bg-background-hover mr-1 size-7 shrink-0 rounded-lg p-0"
                      aria-label={t('activity.edit')}
                    >
                      <MoreVert className={cn('size-4', boardIconClass)} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {actions.map((action) => (
                      <DropdownMenuItem
                        key={action.id}
                        className={cn(boardMenuItemClass, 'rounded-lg px-3')}
                        onSelect={() => runAction(action.id)}
                      >
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                    {kindSettings.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        {kindSettings.map((setting) => (
                          <DropdownMenuCheckboxItem
                            key={setting.id}
                            checked={setting.mixed ? 'indeterminate' : setting.checked}
                            onCheckedChange={() => {
                              const next = toggleKindSetting(definition, setting.id);
                              if (next)
                                onChange({
                                  definition: next,
                                  kind: next.kind,
                                  checkStatus: 'idle',
                                });
                            }}
                            onSelect={(event) => event.preventDefault()}
                            className={cn(
                              boardMenuCheckboxItemClass,
                              'rounded-lg py-1.5 pr-3 pl-8',
                            )}
                          >
                            {t(setting.labelKey)}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </>
                    )}
                    {accessItems.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <p className="text-text-secondary px-3 py-1 text-xs">
                          {t('activity.studentSection')}
                        </p>
                        {accessItems.map((item) => (
                          <DropdownMenuCheckboxItem
                            key={item.key}
                            checked={item.mixed ? 'indeterminate' : item.checked}
                            onCheckedChange={() => {
                              const key = item.key as ActivityStudentAccessKey;
                              onChange({
                                studentAccess: {
                                  ...studentAccess,
                                  [key]: !studentAccess[key],
                                },
                              });
                            }}
                            onSelect={(event) => event.preventDefault()}
                            className={cn(
                              boardMenuCheckboxItemClass,
                              'rounded-lg py-1.5 pr-3 pl-8',
                            )}
                          >
                            {t(STUDENT_ACCESS_LABEL_KEYS[item.key])}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null
            }
          />
        </div>
        <ActivityBody
          definition={definition}
          attempt={value.attempt}
          checkStatus={value.checkStatus}
          byItem={score.byItem}
          mode={mode}
          onDefinition={(next) =>
            onChange({ definition: next, kind: next.kind, checkStatus: 'idle' })
          }
          onAttempt={
            interactLocked
              ? () => undefined
              : (attempt) => onChange({ attempt, checkStatus: 'idle' })
          }
          interactLocked={interactLocked}
        />
      </div>
    </ActivitySessionProvider>
  );
}
