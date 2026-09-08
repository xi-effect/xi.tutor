import i18n from 'i18next';
import { toast } from 'sonner';
import { bytesToMb, getCurrentTariff, tryStartUpload, type UploadKind } from 'common.subscription';
import { trackUploadEvaluationLimit } from 'common.utils';

export const getPlanSizeLimitMessage = (kind: UploadKind): string => {
  const tariff = getCurrentTariff();
  const maxBytes = kind === 'image' ? tariff.maxImageBytes : tariff.maxFileBytes;

  return i18n.t('limits.fileTooLarge', {
    ns: 'subscription',
    plan: i18n.t(`plans.${tariff.id}`, { ns: 'subscription' }),
    kind: i18n.t(kind === 'image' ? 'limits.fileKindImage' : 'limits.fileKindOther', {
      ns: 'subscription',
    }),
    size: `${bytesToMb(maxBytes)} МБ`,
  });
};

export const assertBoardUploadAllowed = (file: File, kind: UploadKind): boolean => {
  const result = tryStartUpload(file, kind);
  if (result.ok) return true;

  trackUploadEvaluationLimit(result, file, 'board');

  if (result.reason === 'size') {
    toast.error(i18n.t('toast.fileTooLarge', { ns: 'board' }), {
      description: getPlanSizeLimitMessage(kind),
      duration: 5000,
    });
  }

  return false;
};
