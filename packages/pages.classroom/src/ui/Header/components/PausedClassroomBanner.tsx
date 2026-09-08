/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Button } from '@xipkg/button';
import { InfoCircle } from '@xipkg/icons';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { SearchParams } from '../../../types/router';

export const PausedClassroomBanner = () => {
  const { t } = useTranslation('classroom');
  const navigate = useNavigate();
  const search: SearchParams = useSearch({ strict: false });
  const isOnInfoTab = search.tab === 'info';

  const handleChangeStatus = () => {
    navigate({
      // @ts-ignore
      search: (prev) => ({
        ...(prev as SearchParams),
        tab: 'info',
      }),
    });
  };

  return (
    <div
      role="status"
      className="bg-tag-orange-background flex w-full items-start gap-3 rounded-2xl px-4 py-3 sm:items-center"
    >
      <InfoCircle className="fill-tag-orange-accent mt-0.5 size-5 shrink-0 sm:mt-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-tag-orange-accent text-sm font-medium">{t('pausedBanner.title')}</p>
          <p className="text-tag-orange-accent/90 mt-0.5 text-sm leading-5">
            {t('pausedBanner.description')}
          </p>
        </div>
        {isOnInfoTab ? null : (
          <Button
            type="button"
            variant="ghost"
            className="bg-background-surface text-tag-orange-accent hover:bg-background-surface/90 h-8 shrink-0 rounded-[10px] px-3 font-medium"
            onClick={handleChangeStatus}
            data-umami-event="classroom-paused-banner-change-status"
          >
            {t('pausedBanner.changeStatus')}
          </Button>
        )}
      </div>
    </div>
  );
};
