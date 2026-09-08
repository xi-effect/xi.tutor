import type { DrShapeId, Editor } from '@ibodr/draw';
import i18n from 'i18next';
import { toast } from 'sonner';
import {
  getBoardElementsLimit,
  isBoardElementsLimitReached,
  useSubscriptionUiStore,
} from 'common.subscription';
import { trackBoardObjectsLimitReached } from 'common.utils';

export const registerBoardElementLimit = (editor: Editor) => {
  let toastShown = false;

  return editor.store.listen((event) => {
    const source = 'source' in event ? event.source : 'user';
    if (source !== 'user') return;

    const added = event.changes?.added;
    if (!added) return;

    const createdShapeIds = Object.values(added)
      .filter((record) => record.typeName === 'shape')
      .map((record) => record.id as DrShapeId);

    if (createdShapeIds.length === 0) return;

    const currentCount = editor.getCurrentPageShapeIds().size;
    const previousCount = currentCount - createdShapeIds.length;

    if (!isBoardElementsLimitReached(previousCount)) return;

    editor.deleteShapes(createdShapeIds);
    trackBoardObjectsLimitReached('elements');

    if (toastShown) return;
    toastShown = true;

    const limit = getBoardElementsLimit();
    toast.error(i18n.t('settings.limitReachedTitle', { ns: 'board' }), {
      description: i18n.t('settings.limitReachedDesc', { ns: 'board', limit }),
      duration: 4000,
      action: {
        label: i18n.t('limits.viewPro', { ns: 'subscription' }),
        onClick: () => useSubscriptionUiStore.getState().openCompare(true),
      },
    });
  });
};
