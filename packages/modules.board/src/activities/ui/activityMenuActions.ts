import type { Editor } from '@ibodr/draw';
import { hasCheckableAnswers } from '../primitives/evaluate';
import type { ActivityShape } from '../shape/ActivityShape';
import {
  applyActivityAction,
  patchActivityDefinitions,
  setActivityStudentAccess,
} from '../shape/activityCommands';
import { normalizeMultipleChoiceDefinition } from '../model/multipleChoice';
import {
  ACTIVITY_STUDENT_ACCESS_KEYS,
  studentAccessFlag,
  type ActivityStudentAccessKey,
} from '../model/studentAccess';

export type ActivityMenuActionId = 'edit' | 'check' | 'reset' | 'reveal';

export type ActivityMenuAction = {
  id: ActivityMenuActionId;
  label: string;
};

export function selectedActivityShapes(
  shapes: { type: string; isLocked?: boolean }[],
): ActivityShape[] {
  return shapes.filter(
    (shape): shape is ActivityShape => shape.type === 'activity' && !shape.isLocked,
  );
}

export function getActivityMenuActions({
  t,
  shapes,
  canEdit,
  isTutor,
  allEditing,
}: {
  t: (key: string) => string;
  shapes: ActivityShape[];
  canEdit: boolean;
  isTutor: boolean;
  allEditing: boolean;
}): ActivityMenuAction[] {
  if (shapes.length === 0) return [];
  const access = isTutor
    ? null
    : {
        canCheck:
          studentAccessFlag(shapes, 'canCheck').checked ||
          studentAccessFlag(shapes, 'canCheck').mixed,
        canReset:
          studentAccessFlag(shapes, 'canReset').checked ||
          studentAccessFlag(shapes, 'canReset').mixed,
        canReveal:
          studentAccessFlag(shapes, 'canReveal').checked ||
          studentAccessFlag(shapes, 'canReveal').mixed,
      };

  const items: ActivityMenuAction[] = [];
  if (canEdit) {
    items.push({
      id: 'edit',
      label: allEditing ? t('activity.play') : t('activity.edit'),
    });
  }

  // В режиме редактирования проверка/сброс/ответ не имеют смысла — только переключение в выполнение
  if (allEditing) return items;

  const allowCheck = isTutor || Boolean(access?.canCheck);
  const allowReset = isTutor || Boolean(access?.canReset);
  const allowReveal = isTutor || Boolean(access?.canReveal);

  if (allowCheck && shapes.some((shape) => hasCheckableAnswers(shape.props.definition))) {
    items.push({ id: 'check', label: t('activity.check') });
  }
  if (allowReset) {
    items.push({ id: 'reset', label: t('activity.reset') });
  }
  if (allowReveal && shapes.some((shape) => shape.props.kind !== 'random-card')) {
    items.push({ id: 'reveal', label: t('activity.reveal') });
  }
  return items;
}

export function runActivityMenuAction(
  editor: Editor,
  shapes: ActivityShape | ActivityShape[],
  action: ActivityMenuActionId,
) {
  applyActivityAction(editor, Array.isArray(shapes) ? shapes : [shapes], action);
}

export function toggleStudentAccess(
  editor: Editor,
  shapes: ActivityShape[],
  key: ActivityStudentAccessKey,
) {
  const { checked } = studentAccessFlag(shapes, key);
  setActivityStudentAccess(editor, shapes, key, !checked);
}

export const STUDENT_ACCESS_LABEL_KEYS: Record<ActivityStudentAccessKey, string> = {
  canInteract: 'activity.studentInteract',
  canCheck: 'activity.studentCheck',
  canReset: 'activity.studentReset',
  canReveal: 'activity.studentReveal',
};

export function studentAccessItems(shapes: ActivityShape[]) {
  return ACTIVITY_STUDENT_ACCESS_KEYS.map((key) => ({
    key,
    ...studentAccessFlag(shapes, key),
  }));
}

export type ActivityKindSetting = {
  id: string;
  labelKey: string;
  checked: boolean;
  mixed: boolean;
  apply: (editor: Editor, shapes: ActivityShape[]) => void;
};

export function getActivityKindSettings(shapes: ActivityShape[]): ActivityKindSetting[] {
  if (shapes.length === 0) return [];
  const settings: ActivityKindSetting[] = [];
  const matching = shapes.filter((shape) => shape.props.definition.kind === 'matching');
  if (matching.length === shapes.length) {
    const drag = matching.map(
      (shape) =>
        shape.props.definition.kind === 'matching' && shape.props.definition.mode === 'drag',
    );
    settings.push({
      id: 'matching-drag',
      labelKey: 'activity.dragMode',
      checked: drag.every(Boolean),
      mixed: !drag.every(Boolean) && drag.some(Boolean),
      apply: (editor, nextShapes) => {
        const enable = !drag.every(Boolean);
        patchActivityDefinitions(editor, nextShapes, (definition) =>
          definition.kind === 'matching'
            ? { ...definition, mode: enable ? 'drag' : 'connect' }
            : null,
        );
      },
    });
  }

  const choices = shapes.filter((shape) => shape.props.definition.kind === 'multiple-choice');
  if (choices.length === shapes.length) {
    const multiple = choices.map(
      (shape) =>
        shape.props.definition.kind === 'multiple-choice' && shape.props.definition.multiple,
    );
    const randomize = choices.map(
      (shape) =>
        shape.props.definition.kind === 'multiple-choice' && shape.props.definition.randomize,
    );
    settings.push({
      id: 'mc-multiple',
      labelKey: 'activity.multipleAnswers',
      checked: multiple.every(Boolean),
      mixed: !multiple.every(Boolean) && multiple.some(Boolean),
      apply: (editor, nextShapes) => {
        const enable = !multiple.every(Boolean);
        patchActivityDefinitions(editor, nextShapes, (definition) => {
          if (definition.kind !== 'multiple-choice') return null;
          return normalizeMultipleChoiceDefinition({ ...definition, multiple: enable });
        });
      },
    });
    settings.push({
      id: 'mc-randomize',
      labelKey: 'activity.randomize',
      checked: randomize.every(Boolean),
      mixed: !randomize.every(Boolean) && randomize.some(Boolean),
      apply: (editor, nextShapes) => {
        const enable = !randomize.every(Boolean);
        patchActivityDefinitions(editor, nextShapes, (definition) =>
          definition.kind === 'multiple-choice' ? { ...definition, randomize: enable } : null,
        );
      },
    });
  }

  const cards = shapes.filter((shape) => shape.props.definition.kind === 'random-card');
  if (cards.length === shapes.length) {
    const noRepeat = cards.map(
      (shape) => shape.props.definition.kind === 'random-card' && shape.props.definition.noRepeat,
    );
    settings.push({
      id: 'card-norepeat',
      labelKey: 'activity.noRepeat',
      checked: noRepeat.every(Boolean),
      mixed: !noRepeat.every(Boolean) && noRepeat.some(Boolean),
      apply: (editor, nextShapes) => {
        const enable = !noRepeat.every(Boolean);
        patchActivityDefinitions(editor, nextShapes, (definition) =>
          definition.kind === 'random-card' ? { ...definition, noRepeat: enable } : null,
        );
      },
    });
  }

  return settings;
}
