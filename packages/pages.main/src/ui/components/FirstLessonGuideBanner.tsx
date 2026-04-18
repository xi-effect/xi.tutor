import { useState } from 'react';
import { Button } from '@xipkg/button';
import { ArrowUpRight, Close } from '@xipkg/icons';

/** Согласовано с блоком «Контроль оплат» (PAYMENTS_HELP_URL) */
const FIRST_LESSON_GUIDE_URL = 'https://support.sovlium.ru';

/** Флаг в localStorage: при значении `'true'` плашка не показывается */
export const FIRST_LESSON_GUIDE_BANNER_STORAGE_KEY = 'sovlium.main.firstLessonGuideBannerDismissed';

export const FirstLessonGuideBanner = () => {
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
    <div className="bg-brand-100 mr-3 flex h-[92px] max-w-full shrink-0 items-center justify-between gap-4 overflow-hidden rounded-2xl px-5 max-[720px]:hidden">
      <div className="min-w-0 flex-1 pr-2">
        <div className="text-gray-0 text-m-base leading-tight font-semibold">
          Как начать первое занятие?
        </div>
        <p className="text-gray-0/85 text-s-base mt-0.5 line-clamp-2 leading-snug">
          Подготовили гайд о том как сделать первые шаги на платформе и начать первое занятие
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="none"
          className="bg-gray-0 text-brand-100 hover:bg-gray-0/90 flex h-8 w-[114px] items-center justify-center gap-2 rounded-lg text-[12px] font-medium"
          onClick={handleRead}
          data-umami-event="main-first-lesson-guide-read"
        >
          Читать
          <ArrowUpRight className="fill-brand-100 size-4 shrink-0" />
        </Button>
        <Button
          type="button"
          variant="none"
          className="hover:bg-gray-0/10 flex size-10 items-center justify-center rounded-xl p-0"
          onClick={handleDismiss}
          aria-label="Закрыть подсказку"
          data-umami-event="main-first-lesson-guide-dismiss"
        >
          <Close className="fill-gray-0 size-5 shrink-0" />
        </Button>
      </div>
    </div>
  );
};
