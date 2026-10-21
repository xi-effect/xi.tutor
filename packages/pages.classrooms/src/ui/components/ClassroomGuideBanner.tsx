import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { ArrowUpRight, Close } from '@xipkg/icons';

const CLASSROOM_GUIDE_URL = 'https://support.sovlium.ru/tutor/classrooms/classroom-list';

/** Флаг в localStorage: при значении `'true'` плашка не показывается */
export const CLASSROOM_GUIDE_BANNER_STORAGE_KEY = 'sovlium.classrooms.guideBannerDismissed';

export const ClassroomGuideBanner = () => {
  const { t } = useTranslation('classrooms');
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(CLASSROOM_GUIDE_BANNER_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const handleRead = () => {
    window.open(CLASSROOM_GUIDE_URL, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(CLASSROOM_GUIDE_BANNER_STORAGE_KEY, 'true');
    } catch {
      // ignore quota / private mode
    }
    setDismissed(true);
  };

  return (
    <div className="bg-action-primary-background-pressed flex h-[92px] max-w-full shrink-0 items-center justify-between gap-4 rounded-2xl px-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
      <div className="min-w-0 flex-1 overflow-hidden pr-2">
        <div className="text-text-on-accent text-m-base leading-tight font-semibold">
          {t('guide.title')}
        </div>
        <p className="text-text-on-accent/85 text-s-base mt-0.5 line-clamp-2 leading-snug">
          {t('guide.description')}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="none"
          className="bg-background-surface text-text-link hover:bg-background-surface/90 flex h-auto items-center justify-center gap-2 rounded-[10px] px-4 py-2 text-sm leading-5 font-medium"
          onClick={handleRead}
          data-umami-event="classrooms-guide-read"
        >
          {t('guide.read')}
          <ArrowUpRight className="fill-icon-brand size-4 shrink-0" />
        </Button>
        <Button
          type="button"
          variant="none"
          className="hover:bg-background-surface/10 flex size-10 items-center justify-center rounded-xl p-0"
          onClick={handleDismiss}
          aria-label={t('guide.closeAria')}
          data-umami-event="classrooms-guide-dismiss"
        >
          <Close className="fill-action-primary-text size-5 shrink-0" />
        </Button>
      </div>
    </div>
  );
};
