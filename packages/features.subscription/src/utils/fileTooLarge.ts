import i18n from 'i18next';
import type { PlanId, UploadKind } from 'common.subscription';
import { bytesToMb } from 'common.subscription';

export const getFileTooLargeMessage = (
  planId: PlanId,
  kind: UploadKind,
  maxBytes: number,
): string =>
  i18n.t('limits.fileTooLarge', {
    ns: 'subscription',
    plan: i18n.t(`plans.${planId}`, { ns: 'subscription' }),
    kind: i18n.t(kind === 'image' ? 'limits.fileKindImage' : 'limits.fileKindOther', {
      ns: 'subscription',
    }),
    size: `${bytesToMb(maxBytes)} МБ`,
  });
