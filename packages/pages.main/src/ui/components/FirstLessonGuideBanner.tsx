import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { ArrowUpRight, Close } from '@xipkg/icons';

/** Согласовано с блоком «Контроль оплат» (PAYMENTS_HELP_URL) */
const FIRST_LESSON_GUIDE_URL =
  'https://support.sovlium.ru/getting-started#%D1%87%D1%82%D0%BE-%D0%B4%D0%B0%D0%BB%D1%8C%D1%88%D0%B5';

/** Флаг в localStorage: при значении `'true'` плашка не показывается */
export const FIRST_LESSON_GUIDE_BANNER_STORAGE_KEY = 'sovlium.main.firstLessonGuideBannerDismissed';

export const FirstLessonGuideBanner = () => {
  const { t } = useTranslation('main');
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(FIRST_LESSON_GUIDE_BANNER_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const handleRead = () => {
    window.open(FIRST_LESSON_GUIDE_URL, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(FIRST_LESSON_GUIDE_BANNER_STORAGE_KEY, 'true');
    } catch {
      // ignore quota / private mode
    }
    setDismissed(true);
  };

  return (
    <div className="bg-action-primary-background-pressed mr-3 flex h-[92px] max-w-full shrink-0 items-center justify-between gap-4 overflow-hidden rounded-2xl px-5">
      <div className="min-w-0 flex-1 pr-2">
        <div className="text-text-on-accent text-m-base leading-tight font-semibold">
          {t('firstLessonGuide.title')}
        </div>
        <p className="text-text-on-accent/85 text-s-base mt-0.5 line-clamp-2 leading-snug">
          {t('firstLessonGuide.description')}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="none"
          className="bg-background-surface text-text-link hover:bg-background-surface/90 flex h-8 w-[114px] items-center justify-center gap-2 rounded-lg text-[12px] font-medium"
          onClick={handleRead}
          data-umami-event="main-first-lesson-guide-read"
        >
          {t('firstLessonGuide.read')}
          <ArrowUpRight className="fill-icon-brand size-4 shrink-0" />
        </Button>
        <Button
          type="button"
          variant="none"
          className="hover:bg-background-surface/10 flex size-10 items-center justify-center rounded-xl p-0"
          onClick={handleDismiss}
          aria-label={t('firstLessonGuide.closeAria')}
          data-umami-event="main-first-lesson-guide-dismiss"
        >
          <Close className="fill-action-primary-text size-5 shrink-0" />
        </Button>
      </div>
    </div>
  );
};
