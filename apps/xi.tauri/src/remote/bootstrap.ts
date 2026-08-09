import { tauriShellEnv } from '../env';
import { getAppInfo } from '../tauri/commands';
import { checkAndApplyUpdate } from '../tauri/updater';
import { evaluateCompat, fetchCompatManifest } from './compat';
import { pickHealthyRemoteUrl } from './health';
import { showErrorSplash, showLoadingSplash, updateLoadingStatus } from './splash';
import type { RemoteBootFailure } from './types';

const DEFAULT_DOWNLOAD_URL = 'https://sovlium.ru';
const UPDATER_BUDGET_MS = 12_000;

function uniqueUrls(urls: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    if (!raw) continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const normalized = trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function runUpdaterBudget(): Promise<void> {
  if (!tauriShellEnv.updaterAutoCheck) return;
  updateLoadingStatus('Проверяем обновления оболочки…');
  await Promise.race([checkAndApplyUpdate({ silent: true }), sleep(UPDATER_BUDGET_MS)]);
}

function failureFromUnreachable(
  failures: Array<{ url: string; error?: string; status?: number }>,
): RemoteBootFailure {
  if (!navigator.onLine) {
    return {
      kind: 'offline',
      message: 'Нет подключения к интернету. Проверьте сеть и попробуйте снова.',
    };
  }

  const detail = failures
    .map((f) => `${f.url} → ${f.status ?? f.error ?? 'unreachable'}`)
    .join('; ');

  return {
    kind: 'unreachable',
    message:
      'Не удалось открыть интерфейс Sovlium. Сервис временно недоступен или сеть блокирует доступ.',
    detail,
  };
}

function renderFailure(failure: RemoteBootFailure, retry: () => void): void {
  const downloadUrl = failure.downloadUrl ?? DEFAULT_DOWNLOAD_URL;

  if (failure.kind === 'compat') {
    showErrorSplash({
      title: 'Нужна новая версия приложения',
      body: failure.message,
      detail: failure.detail,
      primaryLabel: 'Скачать обновление',
      onPrimary: () => {
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      },
      secondaryLabel: 'Повторить проверку',
      onSecondary: retry,
    });
    return;
  }

  showErrorSplash({
    title: failure.kind === 'offline' ? 'Нет сети' : 'Не удалось подключиться',
    body: failure.message,
    detail: failure.detail,
    primaryLabel: 'Повторить',
    onPrimary: retry,
    secondaryLabel: 'Открыть сайт',
    onSecondary: () => {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    },
  });
}

/**
 * Boots into remote UI under `*.sovlium.ru` so session cookies stay same-site
 * with the API. Local splash stays visible until health + compat succeed.
 */
export async function bootstrapRemoteShell(): Promise<void> {
  const retry = () => {
    void bootstrapRemoteShell();
  };

  showLoadingSplash('Подключаемся к Sovlium…');

  try {
    // Prefetch DNS/TLS while we also check the shell updater.
    const candidates = uniqueUrls([tauriShellEnv.remoteUrl, tauriShellEnv.remoteFallbackUrl]);

    if (candidates.length === 0) {
      throw new Error('remote URL is not configured');
    }

    for (const url of candidates) {
      try {
        const origin = new URL(url).origin;
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      } catch {
        // ignore invalid URL — health check will surface it
      }
    }

    await runUpdaterBudget();

    updateLoadingStatus('Проверяем доступность сервиса…');
    const health = await pickHealthyRemoteUrl(candidates, tauriShellEnv.remoteTimeoutMs);
    if ('failures' in health) {
      renderFailure(failureFromUnreachable(health.failures), retry);
      return;
    }

    const remoteUrl = health.url;
    updateLoadingStatus('Проверяем совместимость…');

    let shellVersion = '0.0.0';
    try {
      const info = await getAppInfo();
      shellVersion = info.version || shellVersion;
    } catch {
      // best-effort; treat as 0.0.0 if invoke fails
    }

    const compatFetch = await fetchCompatManifest(remoteUrl, tauriShellEnv.remoteTimeoutMs);
    // Soft-fail on network errors for compat: health already passed.
    const outcome = evaluateCompat(shellVersion, compatFetch.manifest);
    if (outcome.status === 'shell-too-old') {
      renderFailure(
        {
          kind: 'compat',
          message:
            outcome.manifest.message ??
            `Эта версия оболочки (${outcome.shellVersion}) больше не поддерживается. Установите обновление (минимум ${outcome.manifest.minShellVersion}).`,
          downloadUrl: outcome.manifest.downloadUrl ?? DEFAULT_DOWNLOAD_URL,
          detail: `shell=${outcome.shellVersion}; min=${outcome.manifest.minShellVersion}`,
        },
        retry,
      );
      return;
    }

    const navigateTo =
      (outcome.status === 'ok' && outcome.manifest?.remoteUrl
        ? outcome.manifest.remoteUrl
        : remoteUrl) || remoteUrl;

    updateLoadingStatus('Открываем Sovlium…');
    window.location.replace(navigateTo.endsWith('/') ? navigateTo : `${navigateTo}/`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    renderFailure(
      {
        kind: 'unknown',
        message: 'Произошла ошибка при запуске. Попробуйте ещё раз.',
        detail: message,
      },
      retry,
    );
  }
}
