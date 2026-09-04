import { Toggle } from '@xipkg/toggle';
import { Pen } from '@xipkg/icons';
import { useMediaQuery } from '@xipkg/utils';
import { useBoardPreferencesStore } from 'modules.board/preferences';
import { useTranslation } from 'react-i18next';

export const Board = () => {
  const { t } = useTranslation('profile');
  const isMobile = useMediaQuery('(max-width: 719px)');
  const autoCloseDrawShapes = useBoardPreferencesStore((s) => s.autoCloseDrawShapes);
  const setAutoCloseDrawShapes = useBoardPreferencesStore((s) => s.setAutoCloseDrawShapes);

  return (
    <>
      {!isMobile && (
        <span className="dark:text-text-primary text-3xl font-semibold">{t('board.title')}</span>
      )}
      <div className="border-border-strong mt-4 flex w-full flex-col rounded-2xl border p-1">
        <div className="flex w-full flex-col p-3">
          <span className="dark:text-text-primary text-xl font-semibold">{t('board.pencil')}</span>
        </div>
        <div className="mt-2 flex w-full flex-col gap-3 p-3">
          <div className="flex w-full flex-row items-center justify-between gap-4">
            <div className="flex flex-row gap-4">
              <Pen className="fill-icon-brand shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="dark:text-text-primary text-base leading-6 font-semibold">
                  {t('board.autoCloseDrawShapes')}
                </span>
                <span className="text-text-secondary text-s-base">
                  {t('board.autoCloseDrawShapesHint')}
                </span>
              </div>
            </div>
            <Toggle
              checked={autoCloseDrawShapes}
              size="s"
              onCheckedChange={setAutoCloseDrawShapes}
              className="shrink-0"
              data-umami-event="profile-board-auto-close-draw-shapes"
              data-umami-event-state={autoCloseDrawShapes ? 'on' : 'off'}
            />
          </div>
        </div>
      </div>
    </>
  );
};
