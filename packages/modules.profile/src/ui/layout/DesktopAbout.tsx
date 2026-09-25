import { useEffect, useState } from 'react';
import { Button } from '@xipkg/button';
import { getSovliumDesktop, isElectronShell, type UpdaterState } from 'common.platform';

type AppMeta = {
  version: string;
  build: string;
  isDebug: boolean;
};

export function DesktopAbout() {
  const electron = isElectronShell();
  const [meta, setMeta] = useState<AppMeta | null>(null);
  const [update, setUpdate] = useState<UpdaterState | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!electron) return;
    const desktop = getSovliumDesktop();
    if (!desktop) return;

    let alive = true;
    void desktop.app.getInfo().then((info) => {
      if (!alive) return;
      setMeta({
        version: info.version,
        build: info.build || 'dev',
        isDebug: info.isDebug,
      });
    });

    const stop = desktop.updater.onStateChanged((next) => {
      if (alive) setUpdate(next);
    });
    void desktop.updater.getState().then((next) => {
      if (alive) setUpdate((current) => current ?? next);
    });

    return () => {
      alive = false;
      stop();
    };
  }, [electron]);

  if (!electron || !meta) return null;

  const action = nextAction(meta, update);
  const details = statusLine(meta, update);

  return (
    <div className="border-border-default flex shrink-0 flex-col gap-1 border-t pt-4">
      <p className="text-text-secondary text-xs font-medium">О приложении</p>
      <p className="text-text-primary text-sm font-medium">sovlium Desktop</p>
      <p className="text-text-secondary text-sm">{versionLine(meta, update)}</p>
      <p className="text-text-secondary text-sm">Сборка {meta.build}</p>
      {details ? <p className="text-text-secondary text-sm">{details}</p> : null}
      {action ? (
        <Button
          type="button"
          variant="primary"
          size="s"
          className="mt-2 w-fit"
          disabled={pending}
          onClick={() => {
            const desktop = getSovliumDesktop();
            if (!desktop) return;
            setPending(true);
            void action.run(desktop).finally(() => {
              setPending(false);
            });
          }}
        >
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

function versionLine(meta: AppMeta, update: UpdaterState | null): string {
  if (!meta.isDebug && update?.status === 'not-available') {
    return `Версия ${meta.version} актуальна`;
  }
  return `Версия ${meta.version}`;
}

function statusLine(meta: AppMeta, update: UpdaterState | null): string | null {
  if (meta.isDebug || !update) return null;
  if (update.status === 'available' && update.version) {
    return `Доступна версия ${update.version}`;
  }
  if (update.status === 'downloading') {
    const percent = update.percent === null ? '' : ` — ${update.percent}%`;
    return `Скачивание обновления${percent}`;
  }
  if (update.status === 'downloaded') {
    return update.version ? `Обновление ${update.version} готово` : 'Обновление готово';
  }
  if (update.status === 'checking') return 'Проверяем обновления…';
  if (update.status === 'error') {
    return update.message || 'Не удалось проверить обновления';
  }
  return null;
}

function nextAction(
  meta: AppMeta,
  update: UpdaterState | null,
): {
  label: string;
  run: (desktop: NonNullable<ReturnType<typeof getSovliumDesktop>>) => Promise<unknown>;
} | null {
  if (meta.isDebug || !update) return null;
  if (update.status === 'downloaded' && update.canInstall) {
    return {
      label: 'Перезапустить и обновить',
      run: (desktop) => desktop.updater.install(),
    };
  }
  if (update.status === 'available') {
    return {
      label: 'Скачать обновление',
      run: (desktop) => desktop.updater.download(),
    };
  }
  if (update.status === 'error') {
    return {
      label: 'Повторить',
      run: (desktop) => desktop.updater.check(),
    };
  }
  if (update.status === 'not-available') {
    return {
      label: 'Проверить обновления',
      run: (desktop) => desktop.updater.check(),
    };
  }
  return null;
}
