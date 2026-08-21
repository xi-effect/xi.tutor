import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

type ErrorInviteVariant = 'not_found' | 'expired' | 'invalid' | 'self';

interface ErrorInviteProps {
  error?: AxiosError | Error | string;
  variant?: ErrorInviteVariant;
}

const getVariantFromError = (error?: AxiosError | Error | string): ErrorInviteVariant => {
  if (error instanceof AxiosError) {
    if (error.response?.status === 409) return 'self';
    if (error.response?.status === 404) return 'not_found';
    if (error.response?.status === 410) return 'expired';
  }

  if (error instanceof Error && error.message === 'Target is the source') {
    return 'self';
  }

  return 'invalid';
};

export const ErrorInvite = ({ error, variant }: ErrorInviteProps) => {
  const { t } = useTranslation('invites');
  const resolved = variant ?? getVariantFromError(error);

  const title =
    resolved === 'self'
      ? t('error.selfInviteTitle')
      : resolved === 'not_found'
        ? t('error.notFoundTitle')
        : resolved === 'expired'
          ? t('error.expiredTitle')
          : t('error.expiredTitle');

  const description =
    resolved === 'self'
      ? t('error.selfInviteDescription')
      : resolved === 'not_found'
        ? t('error.notFoundDescription')
        : resolved === 'expired'
          ? t('error.expiredDescription')
          : t('error.expiredDescription');

  const hint = resolved === 'self' ? t('error.selfInviteHint') : undefined;

  return (
    <div className="flex w-full flex-col gap-4 p-8 text-center sm:w-[400px]">
      <h4 className="text-xl-base text-text-primary dark:text-text-primary font-semibold">
        {title}
      </h4>
      <span className="text-text-primary dark:text-text-primary">{description}</span>
      {hint ? (
        <span className="text-text-secondary dark:text-text-secondary text-sm">{hint}</span>
      ) : null}
    </div>
  );
};
