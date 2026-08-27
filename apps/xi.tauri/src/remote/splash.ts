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

/**
 * Visual language mirrors `common.ui` LoadingScreen:
 * - page background / text from design tokens
 * - spinner: size-6, 3px border, `text-link` color, `animate-spin`
 * Brand mark + lowercase wordmark sit above the spinner.
 */
function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    :root,
    [data-theme='light'] {
      --splash-bg: #F7F8FA;
      --splash-text: #1E2127;
      --splash-text-secondary: #7D8290;
      --splash-text-muted: #A8ACB7;
      --splash-link: #4143A8;
      --splash-btn-primary-bg: #5C5FD1;
      --splash-btn-primary-bg-hover: #4143A8;
      --splash-btn-primary-text: #FFFFFF;
      --splash-btn-secondary-bg: #F0F1F4;
      --splash-btn-secondary-bg-hover: #E1E3E8;
      --splash-btn-secondary-text: #1E2127;
    }
    [data-theme='dark'] {
      --splash-bg: #111318;
      --splash-text: #FFFFFF;
      --splash-text-secondary: #A8ACB7;
      --splash-text-muted: #7D8290;
      --splash-link: #C7C4F7;
      --splash-btn-primary-bg: #5C5FD1;
      --splash-btn-primary-bg-hover: #9292E7;
      --splash-btn-primary-text: #111318;
      --splash-btn-secondary-bg: #30343C;
      --splash-btn-secondary-bg-hover: #1E2127;
      --splash-btn-secondary-text: #FFFFFF;
    }
    html, body, #root {
      height: 100%;
      margin: 0;
      background: var(--splash-bg, #F7F8FA);
    }
    .sovlium-splash {
      box-sizing: border-box;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      font-family: Inter, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: var(--splash-text);
      background: var(--splash-bg);
      text-align: center;
      -webkit-user-select: none;
      user-select: none;
    }
    .sovlium-splash * { box-sizing: border-box; }
    .sovlium-splash__logo {
      display: block;
      width: 168px;
      height: auto;
      margin: 0 0 28px;
    }
    .sovlium-splash__logo--dark { display: none; }
    [data-theme='dark'] .sovlium-splash__logo--light { display: none; }
    [data-theme='dark'] .sovlium-splash__logo--dark { display: block; }
    .sovlium-splash__spinner {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 9999px;
      border: 3px solid currentColor;
      border-top-color: transparent;
      color: var(--splash-link);
      animation: sovlium-spin 1s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes sovlium-spin { to { transform: rotate(360deg); } }
    .sovlium-splash__title {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--splash-text);
    }
    .sovlium-splash__body {
      margin: 0;
      max-width: 420px;
      font-size: 14px;
      line-height: 1.45;
      color: var(--splash-text-secondary);
    }
    .sovlium-splash__detail {
      margin: 12px 0 0;
      max-width: 480px;
      font-size: 12px;
      line-height: 1.4;
      color: var(--splash-text-muted);
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
      font-family: inherit;
    }
    .sovlium-splash__btn--primary {
      background: var(--splash-btn-primary-bg);
      color: var(--splash-btn-primary-text);
    }
    .sovlium-splash__btn--primary:hover {
      background: var(--splash-btn-primary-bg-hover);
    }
    .sovlium-splash__btn--secondary {
      background: var(--splash-btn-secondary-bg);
      color: var(--splash-btn-secondary-text);
    }
    .sovlium-splash__btn--secondary:hover {
      background: var(--splash-btn-secondary-bg-hover);
    }
  `;
  document.head.appendChild(style);
}

function logoMarkup(): string {
  // Served from xi.web/public (xi.tauri publicDir). Wordmark is already lowercase.
  return `
    <img
      class="sovlium-splash__logo sovlium-splash__logo--light"
      src="/assets/brand/navigationlogo-default-light.svg"
      width="168"
      height="50"
      alt="sovlium"
    />
    <img
      class="sovlium-splash__logo sovlium-splash__logo--dark"
      src="/assets/brand/navigationlogo-default-dark.svg"
      width="168"
      height="50"
      alt="sovlium"
    />
  `;
}

function mountRoot(): HTMLElement {
  ensureStyles();
  const root = document.getElementById('root');
  if (!root) throw new Error('#root missing');
  root.replaceChildren();
  return root;
}

export function showLoadingSplash(status = 'Подключаемся к sovlium…'): void {
  const root = mountRoot();
  root.innerHTML = `
    <div class="sovlium-splash" role="status" aria-live="polite">
      ${logoMarkup()}
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
    ${logoMarkup()}
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
