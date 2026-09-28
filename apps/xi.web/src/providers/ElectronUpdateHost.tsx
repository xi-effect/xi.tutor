import { useEffect, useState } from 'react';
import { Button } from '@xipkg/button';
import { getSovliumDesktop, isElectronMainSurface, type UpdaterState } from 'common.platform';

export function ElectronUpdateHost() {
  const [state, setState] = useState<UpdaterState | null>(null);

  useEffect(() => {
    if (!isElectronMainSurface()) return;
    const desktop = getSovliumDesktop();
    if (!desktop) return;

    const stop = desktop.updater.onStateChanged((next) => {
      setState(next);
    });
    void desktop.updater.getState().then((next) => {
      setState((current) => current ?? next);
    });
    return stop;
  }, []);

  if (!state) return null;

  if (state.status === 'downloaded' && state.canInstall) {
    const version = state.version ? ` ${state.version}` : '';
    return (
      <UpdateBanner
        title={`Обновление${version} готово`}
        actionLabel="Перезапустить и обновить"
        onAction={() => {
          void getSovliumDesktop()?.updater.install();
        }}
      />
    );
  }

  if (state.status === 'downloading') {
    const percent = state.percent === null ? '' : ` — ${state.percent}%`;
    return <UpdateBanner title={`Скачивание обновления${percent}`} />;
  }

  if (state.status === 'available' && state.version) {
    return (
      <UpdateBanner
        title={`Доступна версия ${state.version}`}
        actionLabel="Скачать обновление"
        onAction={() => {
          void getSovliumDesktop()?.updater.download();
        }}
      />
    );
  }

  return null;
}

function UpdateBanner({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-90 flex justify-center px-4">
      <div className="bg-background-surface border-border-default pointer-events-auto flex max-w-[calc(100vw-32px)] items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg">
        <p className="text-text-primary text-sm font-medium">{title}</p>
        {actionLabel && onAction ? (
          <Button type="button" variant="primary" size="s" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
