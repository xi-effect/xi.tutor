import { useLocation, useSearch } from '@tanstack/react-router';
import { cn } from '@xipkg/utils';
import { getInviteProgress } from 'common.utils';
import { useTranslation } from 'react-i18next';

type InviteProgressCardProps = {
  isAuthenticated?: boolean;
  className?: string;
};

export const InviteProgressCard = ({ isAuthenticated, className }: InviteProgressCardProps) => {
  const { t } = useTranslation('commonUi');
  const location = useLocation();
  const search = useSearch({ strict: false }) as { invite?: string; redirect?: string };
  const progress = getInviteProgress({
    pathname: location.pathname,
    search,
    isAuthenticated,
  });

  if (!progress) return null;

  return (
    <div
      className={cn(
        'text-text-link bg-status-info-background w-full min-w-0 rounded-2xl px-3 py-3 text-center text-sm text-pretty break-words sm:p-4',
        className,
      )}
    >
      <p className="font-medium">
        {t('inviteProgress.remaining', {
          count: progress.remaining,
          total: progress.total,
        })}
      </p>
      {progress.remaining > 1 ? <p className="mt-1">{t('inviteProgress.hint')}</p> : null}
    </div>
  );
};
