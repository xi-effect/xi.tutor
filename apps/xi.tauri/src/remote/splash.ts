type SplashMode = 'loading' | 'error' | 'update-required';

export interface SplashErrorModel {
  title: string;
  body: string;
  detail?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const STYLE_ID = 'sovlium-remote-splash-style';

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .sovlium-splash {
      box-sizing: border-box;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      font-family: "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #1a1d23;
      background:
        radial-gradient(1200px 600px at 50% -10%, #e8eef8 0%, transparent 55%),
        #f7f8fa;
      text-align: center;
      -webkit-user-select: none;
      user-select: none;
    }
    .sovlium-splash * { box-sizing: border-box; }
    .sovlium-splash__brand {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin: 0 0 28px;
    }
    .sovlium-splash__spinner {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid #d7dde8;
      border-top-color: #3b82f6;
      animation: sovlium-spin 0.8s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes sovlium-spin { to { transform: rotate(360deg); } }
    .sovlium-splash__title {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .sovlium-splash__body {
      margin: 0;
      max-width: 420px;
      font-size: 14px;
      line-height: 1.45;
      color: #5b6575;
    }
    .sovlium-splash__detail {
      margin: 12px 0 0;
      max-width: 480px;
      font-size: 12px;
      line-height: 1.4;
      color: #8a94a6;
      word-break: break-word;
    }
    .sovlium-splash__actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 24px;
    }
    .sovlium-splash__btn {
      appearance: none;
      border: 0;
      border-radius: 10px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .sovlium-splash__btn--primary {
      background: #2563eb;
      color: #fff;
    }
    .sovlium-splash__btn--primary:hover { background: #1d4ed8; }
    .sovlium-splash__btn--secondary {
      background: #e8edf5;
      color: #1a1d23;
    }
    .sovlium-splash__btn--secondary:hover { background: #dbe3f0; }
  `;
  document.head.appendChild(style);
}

function mountRoot(): HTMLElement {
  ensureStyles();
  const root = document.getElementById('root');
  if (!root) throw new Error('#root missing');
  root.replaceChildren();
  return root;
}

export function showLoadingSplash(status = 'Подключаемся к Sovlium…'): void {
  const root = mountRoot();
  root.innerHTML = `
    <div class="sovlium-splash" role="status" aria-live="polite">
      <p class="sovlium-splash__brand">Sovlium</p>
      <div class="sovlium-splash__spinner" aria-hidden="true"></div>
      <p class="sovlium-splash__title">${escapeHtml(status)}</p>
      <p class="sovlium-splash__body">Проверяем сеть и загружаем интерфейс.</p>
    </div>
  `;
}

export function updateLoadingStatus(status: string): void {
  const title = document.querySelector('.sovlium-splash__title');
  if (title) title.textContent = status;
}

export function showErrorSplash(model: SplashErrorModel): void {
  const root = mountRoot();
  const shell = document.createElement('div');
  shell.className = 'sovlium-splash';
  shell.setAttribute('role', 'alert');

  shell.innerHTML = `
    <p class="sovlium-splash__brand">Sovlium</p>
    <p class="sovlium-splash__title"></p>
    <p class="sovlium-splash__body"></p>
    ${model.detail ? '<p class="sovlium-splash__detail"></p>' : ''}
    <div class="sovlium-splash__actions"></div>
  `;

  shell.querySelector('.sovlium-splash__title')!.textContent = model.title;
  shell.querySelector('.sovlium-splash__body')!.textContent = model.body;
  if (model.detail) {
    shell.querySelector('.sovlium-splash__detail')!.textContent = model.detail;
  }

  const actions = shell.querySelector('.sovlium-splash__actions')!;
  const primary = document.createElement('button');
  primary.type = 'button';
  primary.className = 'sovlium-splash__btn sovlium-splash__btn--primary';
  primary.textContent = model.primaryLabel;
  primary.addEventListener('click', model.onPrimary);
  actions.appendChild(primary);

  if (model.secondaryLabel && model.onSecondary) {
    const secondary = document.createElement('button');
    secondary.type = 'button';
    secondary.className = 'sovlium-splash__btn sovlium-splash__btn--secondary';
    secondary.textContent = model.secondaryLabel;
    secondary.addEventListener('click', model.onSecondary);
    actions.appendChild(secondary);
  }

  root.appendChild(shell);
}

export type { SplashMode };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
