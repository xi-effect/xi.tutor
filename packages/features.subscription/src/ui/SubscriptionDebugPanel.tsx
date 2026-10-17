import { useState, type ReactNode } from 'react';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { requestProFeatureDialog, useSubscriptionStore } from 'common.subscription';
import { useTranslation } from 'react-i18next';
import { ProBadge } from './ProBadge';

export const SubscriptionDebugPanel = () => {
  const { t } = useTranslation('subscription');
  const [open, setOpen] = useState(false);
  const mock = useSubscriptionStore((state) => state.mock);
  const patchMock = useSubscriptionStore((state) => state.patchMock);

  return (
    <div className="pointer-events-none fixed right-3 bottom-20 z-50 flex flex-col items-end gap-2 max-[960px]:bottom-28">
      {open ? (
        <div className="bg-background-surface border-border-default pointer-events-auto w-72 rounded-2xl border p-3 shadow-lg">
          <p className="text-text-primary mb-3 text-sm font-semibold">{t('debug.title')}</p>
          <DebugRow label={t('debug.boardLimit')}>
            <TogglePair
              leftLabel={t('debug.underLimit')}
              rightLabel={t('debug.atLimit')}
              right={mock.boardAtLimit}
              onLeft={() => patchMock({ boardAtLimit: false })}
              onRight={() => patchMock({ boardAtLimit: true })}
            />
          </DebugRow>
          <DebugRow label={t('debug.oversized')}>
            <TogglePair
              leftLabel={t('debug.fileOk')}
              rightLabel={t('debug.fileOver')}
              right={mock.forceOversizedFile}
              onLeft={() => patchMock({ forceOversizedFile: false })}
              onRight={() => patchMock({ forceOversizedFile: true })}
            />
          </DebugRow>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="s"
              className="h-8 flex-1"
              onClick={() => requestProFeatureDialog('extraProTools')}
            >
              {t('debug.proFeature')}
            </Button>
            <ProBadge />
          </div>
        </div>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        size="s"
        className="pointer-events-auto h-8 rounded-full px-3 text-xs"
        onClick={() => setOpen((value) => !value)}
      >
        {t('debug.open')}
      </Button>
    </div>
  );
};

const DebugRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="mb-2 flex flex-col gap-1">
    <span className="text-text-secondary text-xs">{label}</span>
    {children}
  </div>
);

const TogglePair = ({
  leftLabel,
  rightLabel,
  right,
  onLeft,
  onRight,
}: {
  leftLabel: string;
  rightLabel: string;
  right: boolean;
  onLeft: () => void;
  onRight: () => void;
}) => (
  <div className="flex gap-1">
    <button
      type="button"
      className={cn(
        'flex-1 rounded-md px-2 py-1 text-xs',
        !right
          ? 'bg-status-info-background text-text-link'
          : 'bg-background-subtle text-text-secondary',
      )}
      onClick={onLeft}
    >
      {leftLabel}
    </button>
    <button
      type="button"
      className={cn(
        'flex-1 rounded-md px-2 py-1 text-xs',
        right
          ? 'bg-status-info-background text-text-link'
          : 'bg-background-subtle text-text-secondary',
      )}
      onClick={onRight}
    >
      {rightLabel}
    </button>
  </div>
);
