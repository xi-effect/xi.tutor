import { env } from 'common.env';

const PREVIEW_HIDDEN_KEY = 'sovlium.firstSteps.previewHidden';

/** Локальный просмотр чек-листа. Не меняет этап обучения на сервере. */
export const isFirstStepsPreviewEnabled = (): boolean => env.VITE_FIRST_STEPS_PREVIEW;

const isPreviewHidden = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(PREVIEW_HIDDEN_KEY) === '1';
  } catch {
    return false;
  }
};

export const shouldShowFirstSteps = (onboardingStage: string | undefined): boolean => {
  if (onboardingStage === 'training') return true;
  return isFirstStepsPreviewEnabled() && !isPreviewHidden();
};

/** Прячет карточку до конца сессии, не трогая этап на сервере. */
export const hideFirstStepsPreview = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(PREVIEW_HIDDEN_KEY, '1');
  } catch {
    // приватный режим
  }
};
