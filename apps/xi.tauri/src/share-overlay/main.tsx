import { emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import './styles.css';

type Tool = 'pointer' | 'pen' | 'highlighter' | 'eraser';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#f8fafc'];

const TOOLS: Array<{ id: Tool; label: string; icon: string }> = [
  {
    id: 'pointer',
    label: 'Курсор',
    icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4 3.5 19 12l-6.2 1.7L11 21z"/></svg>',
  },
  {
    id: 'pen',
    label: 'Перо',
    icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20 16.5 7.5a2.1 2.1 0 0 1 3 3L7 23H4z"/><path d="m14.5 9.5 3 3"/></svg>',
  },
  {
    id: 'highlighter',
    label: 'Маркер',
    icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 21h10M8.5 17 16 5l3 1.5-7.5 12z"/></svg>',
  },
  {
    id: 'eraser',
    label: 'Ластик',
    icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 15 7-7 5 5-7 7H8z"/><path d="M4 20h16"/></svg>',
  },
];

let tool: Tool = 'pointer';
let color = COLORS[0];

async function sendCommand(payload: { type: string; tool?: Tool; color?: string }): Promise<void> {
  await emit('share-annotate-command', payload);
}

async function setTool(next: Tool): Promise<void> {
  tool = next;
  syncToolbar();
  try {
    await invoke('share_annotate_set_click_through', { ignore: next === 'pointer' });
    await sendCommand({ type: 'set-tool', tool: next, color });
  } catch (err) {
    console.error('[share-overlay] set tool failed', err);
  }
}

async function setColor(next: string): Promise<void> {
  color = next;
  if (tool === 'pointer' || tool === 'eraser') {
    tool = 'pen';
  }
  syncToolbar();
  try {
    await invoke('share_annotate_set_click_through', { ignore: false });
    await sendCommand({ type: 'set-tool', tool, color });
  } catch (err) {
    console.error('[share-overlay] set color failed', err);
  }
}

function syncToolbar(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.tool === tool);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.color === color);
  });
}

function mount(): void {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = `
    <div class="share-bar">
      <div class="share-bar__grip" data-tauri-drag-region></div>
      <div class="share-bar__pulse" aria-hidden="true"></div>
      <div class="share-bar__copy" data-tauri-drag-region>
        <p class="share-bar__brand">sovlium</p>
        <p class="share-bar__title">Демонстрация экрана</p>
      </div>
      <div class="share-bar__divider" aria-hidden="true"></div>
      <div class="share-bar__tools" role="toolbar" aria-label="Аннотации">
        ${TOOLS.map(
          (item) => `
            <button type="button" class="share-bar__icon" data-tool="${item.id}" title="${item.label}" aria-label="${item.label}">
              ${item.icon}
            </button>
          `,
        ).join('')}
      </div>
      <div class="share-bar__colors" role="group" aria-label="Цвет">
        ${COLORS.map(
          (value) => `
            <button type="button" class="share-bar__swatch" data-color="${value}" style="--swatch:${value}" title="Цвет" aria-label="Цвет ${value}"></button>
          `,
        ).join('')}
      </div>
      <div class="share-bar__tools">
        <button type="button" class="share-bar__icon" id="share-undo" title="Отменить" aria-label="Отменить">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 10h10a6 6 0 1 1 0 12H9"/><path d="M8 6 4 10l4 4"/></svg>
        </button>
        <button type="button" class="share-bar__icon" id="share-clear" title="Очистить" aria-label="Очистить">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2m-7 0 1 13h8l1-13"/></svg>
        </button>
      </div>
      <div class="share-bar__actions">
        <button type="button" class="share-bar__btn share-bar__btn--ghost" id="share-focus">
          В звонок
        </button>
        <button type="button" class="share-bar__btn share-bar__btn--danger" id="share-stop">
          Остановить
        </button>
      </div>
    </div>
  `;

  document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.tool as Tool | undefined;
      if (next) void setTool(next);
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.color;
      if (next) void setColor(next);
    });
  });

  document.getElementById('share-undo')?.addEventListener('click', () => {
    void sendCommand({ type: 'undo' }).catch((err) => {
      console.error('[share-overlay] undo failed', err);
    });
  });

  document.getElementById('share-clear')?.addEventListener('click', () => {
    void sendCommand({ type: 'clear' }).catch((err) => {
      console.error('[share-overlay] clear failed', err);
    });
  });

  document.getElementById('share-stop')?.addEventListener('click', () => {
    void invoke('share_overlay_request_stop').catch((err) => {
      console.error('[share-overlay] stop failed', err);
    });
  });

  document.getElementById('share-focus')?.addEventListener('click', () => {
    void invoke('share_overlay_focus_main').catch((err) => {
      console.error('[share-overlay] focus main failed', err);
    });
  });

  syncToolbar();
}

mount();
