/**
 * Zoom-like «what to share» dialog for the Electron shell.
 *
 * Replaces the macOS system picker so the app knows exactly which display was
 * shared (the annotation canvas is placed over it) and whether it is a window.
 */

import { useEffect, useState, type ReactElement } from 'react';
import { isElectronShell, registerShareSourcePicker, type ShareSource } from 'common.platform';

type Request = {
  sources: ShareSource[];
  resolve(source: ShareSource | null): void;
};

type TileProps = {
  source: ShareSource;
  selected: boolean;
  onSelect(): void;
  onConfirm(): void;
};

function SourceTile({ source, selected, onSelect, onConfirm }: TileProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onSelect}
      onDoubleClick={onConfirm}
      aria-pressed={selected}
      className={`flex min-w-0 flex-col gap-2 rounded-xl border-2 bg-transparent p-2 text-left transition-colors ${
        selected ? 'border-brand-80' : 'hover:bg-background-page border-transparent'
      }`}
    >
      <div className="bg-background-page flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg">
        {source.thumbnail ? (
          <img
            src={source.thumbnail}
            alt=""
            className="h-full w-full object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-text-muted text-xs-base">Нет превью</span>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        {source.appIcon ? (
          <img src={source.appIcon} alt="" className="h-4 w-4 shrink-0" draggable={false} />
        ) : null}
        <span className="text-text-primary text-s-base truncate">{source.name}</span>
      </div>
    </button>
  );
}

function PickerDialog({ request, onClose }: { request: Request; onClose(): void }): ReactElement {
  const screens = request.sources.filter((source) => source.kind === 'screen');
  const windows = request.sources.filter((source) => source.kind === 'window');
  const [selectedId, setSelectedId] = useState<string | null>(screens[0]?.id ?? null);
  const selected = request.sources.find((source) => source.id === selectedId) ?? null;

  const finish = (source: ShareSource | null) => {
    request.resolve(source);
    onClose();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const section = (title: string, items: ShareSource[], hint?: string) =>
    items.length === 0 ? null : (
      <section className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-text-primary text-m-base font-semibold">{title}</h3>
          {hint ? <span className="text-text-secondary text-xs-base">{hint}</span> : null}
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {items.map((source) => (
            <SourceTile
              key={source.id}
              source={source}
              selected={source.id === selectedId}
              onSelect={() => setSelectedId(source.id)}
              onConfirm={() => finish(source)}
            />
          ))}
        </div>
      </section>
    );

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) finish(null);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Демонстрация экрана"
        className="bg-background-surface border-border-default flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="border-border-default border-b px-6 py-4">
          <h2 className="text-text-primary text-xl-base font-semibold">Что показать?</h2>
        </div>
        <div className="flex min-h-0 flex-col gap-6 overflow-y-auto px-6 py-4">
          {section('Весь экран', screens, 'рисовать поверх можно только здесь')}
          {section('Окно', windows)}
          {request.sources.length === 0 ? (
            <p className="text-text-secondary text-s-base">
              Нет доступных источников. Проверьте разрешение «Запись экрана» в настройках macOS.
            </p>
          ) : null}
        </div>
        <div className="border-border-default flex justify-end gap-2 border-t px-6 py-4">
          <button
            type="button"
            onClick={() => finish(null)}
            className="bg-background-page text-text-secondary hover:bg-background-subtle text-s-base rounded-xl px-5 py-2.5 font-medium"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => finish(selected)}
            className="bg-brand-80 hover:bg-brand-90 active:bg-brand-100 text-text-on-accent disabled:bg-brand-20 disabled:text-text-disabled text-s-base disabled:hover:bg-brand-20 rounded-xl px-5 py-2.5 font-medium"
          >
            Показать
          </button>
        </div>
      </div>
    </div>
  );
}

export function ElectronShareSourcePicker(): ReactElement | null {
  const [request, setRequest] = useState<Request | null>(null);

  useEffect(() => {
    if (!isElectronShell()) return;
    return registerShareSourcePicker(
      (sources) =>
        new Promise<ShareSource | null>((resolve) => {
          setRequest((current) => {
            current?.resolve(null);
            return { sources, resolve };
          });
        }),
    );
  }, []);

  useEffect(() => {
    return () => request?.resolve(null);
  }, [request]);

  if (!request) return null;
  return <PickerDialog request={request} onClose={() => setRequest(null)} />;
}
