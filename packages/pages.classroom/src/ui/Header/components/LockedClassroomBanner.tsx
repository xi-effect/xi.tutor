/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Button } from '@xipkg/button';
import { InfoCircle } from '@xipkg/icons';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCurrentPlan } from 'common.services';
import { useTranslation } from 'react-i18next';
import type { SearchParams } from '../../../types/router';

export const LockedClassroomBanner = ({ isTutor }: { isTutor: boolean }) => {
  const { t } = useTranslation('classroom');
  const navigate = useNavigate();
  const search: SearchParams = useSearch({ strict: false });
  const isOnInfoTab = search.tab === 'info';
  const planQuery = useCurrentPlan({ enabled: isTutor });
  const limit = planQuery.data?.max_active_classrooms;

  const handleChangeStatus = () => {
    navigate({
      // @ts-ignore
      search: (prev) => ({
        ...(prev as SearchParams),
        tab: 'info',
      }),
    });
  };

  const description = isTutor
    ? typeof limit === 'number'
      ? t('lockedBanner.description', { count: limit })
      : t('lockedBanner.descriptionFallback')
    : t('lockedBanner.studentDescription');

  return (
    <div
      role="status"
      className="bg-status-error-background flex w-full items-start gap-3 rounded-2xl px-4 py-3 sm:items-center"
    >
      <InfoCircle className="fill-text-danger mt-0.5 size-5 shrink-0 sm:mt-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-text-danger text-sm font-medium">{t('lockedBanner.title')}</p>
          <p className="text-text-danger/90 mt-0.5 text-sm leading-5">{description}</p>
        </div>
        {isTutor && !isOnInfoTab ? (
          <Button
            type="button"
            variant="ghost"
            className="bg-background-surface text-text-danger hover:bg-background-surface/90 h-8 shrink-0 rounded-[10px] px-3 font-medium"
            onClick={handleChangeStatus}
            data-umami-event="classroom-locked-banner-change-status"
          >
            {t('lockedBanner.changeStatus')}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
