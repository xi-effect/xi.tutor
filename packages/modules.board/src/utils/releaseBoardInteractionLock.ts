import type { Editor } from '@ibodr/draw';

const WATCH_MS = 1000;

function clearBodyPointerLock() {
  const body = document.body;
  const root = document.documentElement;
  if (body.style.pointerEvents === 'none') body.style.pointerEvents = '';
  if (root.style.pointerEvents === 'none') root.style.pointerEvents = '';
  body.removeAttribute('data-scroll-locked');
  for (const className of [...body.classList]) {
    if (className.startsWith('block-interactivity-')) body.classList.remove(className);
  }
}

/**
 * Очистка снимает фокус с редактора (клик был в модалке) и может оставить
 * `pointer-events: none` на body, если слой Radix закроется уже после удаления.
 * Без фокуса колесо не зумит доску. Наблюдатель догоняет позднее восстановление
 * `none`, которое слой записывает в style после нашего сброса.
 */
export function releaseBoardInteractionLock(editor: Editor | null) {
  clearBodyPointerLock();

  try {
    editor?.interrupt();
    editor?.focus();
  } catch {
    // Контейнер ещё мог быть скрыт закрывающейся модалкой.
  }

  const observer = new MutationObserver(clearBodyPointerLock);
  observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
  window.setTimeout(() => observer.disconnect(), WATCH_MS);
}
