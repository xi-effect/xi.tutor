import type { DrShapeId, Editor } from '@ibodr/draw';
import i18n from 'i18next';
import { toast } from 'sonner';
import {
  getBoardElementsLimit,
  getCurrentTariff,
  getTariff,
  isBoardElementsLimitReached,
  isCurrentUserTutor,
  isStorageQuotaReached,
  readCachedPlanId,
  requestStorageLimitDialog,
  useSubscriptionUiStore,
} from 'common.subscription';
import {
  trackBoardObjectsLimitReached,
  trackSubscriptionPaywallShown,
  trackSubscriptionPaywallUpgradeClicked,
} from 'common.utils';

const CONTAINER_SHAPE_TYPES = new Set(['group', 'frame']);

const canUpgradeBoardLimit = (): boolean =>
  isCurrentUserTutor() &&
  getCurrentTariff().id !== 'pro' &&
  getTariff('pro').maxBoardElements > getBoardElementsLimit();

export const showBoardElementsLimitToast = () => {
  const limit = getBoardElementsLimit();
  const canUpgrade = canUpgradeBoardLimit();
  if (isCurrentUserTutor()) {
    const planId = readCachedPlanId();
    trackSubscriptionPaywallShown(
      {
        limitType: 'board_objects',
        currentPlan: planId ?? undefined,
      },
      5000,
    );
  }
  toast.error(i18n.t('settings.limitReachedTitle', { ns: 'board' }), {
    id: 'board-elements-limit',
    description: i18n.t('settings.limitReachedDesc', { ns: 'board', limit }),
    duration: 4000,
    ...(canUpgrade
      ? {
          action: {
            label: i18n.t('limits.viewPro', { ns: 'subscription' }),
            onClick: () => {
              const planId = readCachedPlanId();
              trackSubscriptionPaywallUpgradeClicked({
                limitType: 'board_objects',
                currentPlan: planId ?? undefined,
              });
              useSubscriptionUiStore.getState().setAnalyticsSource('board_objects_limit');
              useSubscriptionUiStore.getState().openCompare(true);
            },
          },
        }
      : {}),
  });
};

/** Сколько фигур ещё можно добавить на текущую страницу. */
export const getRemainingBoardElements = (editor: Editor): number =>
  Math.max(0, getBoardElementsLimit() - editor.getCurrentPageShapeIds().size);

/**
 * У редактора свой потолок, по умолчанию 4000. Создание, дублирование и вставка
 * проверяют его раньше нашего лимита тарифа и молча отбрасывают новые фигуры.
 */
export const syncBoardMaxShapesPerPage = (editor: Editor) => {
  const limit = getBoardElementsLimit();
  if (editor.options.maxShapesPerPage === limit) return;
  (editor.options as { maxShapesPerPage: number }).maxShapesPerPage = limit;
};

/**
 * Группа и рамка не занимают хранилище. Новую обёртку вокруг уже существующих фигур не удаляем:
 * deleteShapes удалил бы вместе с ней и эти фигуры у всех участников.
 */
const collectBlockedForStorage = (editor: Editor, createdIds: DrShapeId[]): DrShapeId[] => {
  const created = new Set<DrShapeId>(createdIds);

  return createdIds.filter((id) => {
    const shape = editor.getShape(id);
    if (!shape || !CONTAINER_SHAPE_TYPES.has(shape.type)) return true;

    return editor
      .getSortedChildIdsForParent(id)
      .every((childId) => created.has(childId as DrShapeId));
  });
};

export const registerBoardElementLimit = (editor: Editor) => {
  syncBoardMaxShapesPerPage(editor);

  const stopListening = editor.store.listen((event) => {
    const source = 'source' in event ? event.source : 'user';
    if (source !== 'user') return;

    const added = event.changes?.added;
    if (!added) return;

    const createdShapeIds = Object.values(added)
      .filter((record) => record.typeName === 'shape')
      .map((record) => record.id as DrShapeId);

    if (createdShapeIds.length === 0) return;

    if (isStorageQuotaReached()) {
      const blocked = collectBlockedForStorage(editor, createdShapeIds);
      if (blocked.length === 0) return;

      editor.deleteShapes(blocked);
      requestStorageLimitDialog();
      return;
    }

    const currentCount = editor.getCurrentPageShapeIds().size;
    const previousCount = currentCount - createdShapeIds.length;

    if (currentCount <= getBoardElementsLimit() && !isBoardElementsLimitReached(previousCount)) {
      return;
    }

    editor.deleteShapes(createdShapeIds);
    trackBoardObjectsLimitReached('elements');
    showBoardElementsLimitToast();
  });

  const handleMaxShapes = () => {
    trackBoardObjectsLimitReached('elements');
    showBoardElementsLimitToast();
  };
  editor.on('max-shapes', handleMaxShapes);

  return () => {
    stopListening();
    editor.off('max-shapes', handleMaxShapes);
  };
};
