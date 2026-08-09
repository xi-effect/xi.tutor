import { invoke } from '@tauri-apps/api/core';
import './styles.css';

function mount(): void {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = `
    <div class="share-bar" data-tauri-drag-region>
      <div class="share-bar__pulse" aria-hidden="true"></div>
      <div class="share-bar__copy">
        <p class="share-bar__brand">Sovlium</p>
        <p class="share-bar__title">Демонстрация экрана</p>
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

  const stop = document.getElementById('share-stop');
  const focus = document.getElementById('share-focus');

  stop?.addEventListener('click', () => {
    void invoke('share_overlay_request_stop').catch((err) => {
      console.error('[share-overlay] stop failed', err);
    });
  });

  focus?.addEventListener('click', () => {
    void invoke('share_overlay_focus_main').catch((err) => {
      console.error('[share-overlay] focus main failed', err);
    });
  });
}

mount();
