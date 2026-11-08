import { reportBoardProblem } from '../utils/boardProblem';
import {
  BOARD_CHROME_AWARE_ATTR,
  type BoardChromeInsets,
  type CompactChromeEdge,
  compactChromeOverrides,
} from '../utils/boardToolbarDock';

const EDGES: CompactChromeEdge[] = ['top', 'right', 'bottom', 'left'];
const BOARD_ROOT_ID = 'whiteboard-container';

function isInsideBoard(node: Node | null): boolean {
  if (!node) return false;
  const board = document.getElementById(BOARD_ROOT_ID);
  if (!board) return false;
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element && board.contains(element));
}

function clearElement(element: HTMLElement) {
  for (const edge of EDGES) element.style[edge] = '';
  element.style.maxHeight = '';
  delete element.dataset.boardChromePatch;
}

/**
 * Текущий опубликованный CompactView ставит звонок и чат utility-классами
 * (`bottom-[72px]`, `top-16`, `left-22`). Пока пакет сам не читает переменные
 * хрома, подменяем отступы инлайном. Новый пакет помечает корень
 * `data-board-chrome-aware` — тогда патч не нужен.
 */
export function startLegacyCompactChromeSync(insets: BoardChromeInsets): () => void {
  const patched = new Set<HTMLElement>();
  let frame = 0;

  const clear = () => {
    for (const element of patched) clearElement(element);
    patched.clear();
  };

  const apply = () => {
    frame = 0;
    try {
      if (document.querySelector(`[${BOARD_CHROME_AWARE_ATTR}]`)) {
        clear();
        return;
      }

      const seen = new Set<HTMLElement>();
      for (const element of document.querySelectorAll('.z-20, .z-100')) {
        // Патч только для звонка и чата вне холста. SVG и фигуры доски сюда не входят:
        // у SVG className не строка, и .split роняет открытие доски.
        if (!(element instanceof HTMLElement) || isInsideBoard(element)) continue;
        const overrides = compactChromeOverrides(element.getAttribute('class') ?? '', insets);
        if (!overrides) continue;
        seen.add(element);
        patched.add(element);
        element.dataset.boardChromePatch = '1';
        for (const edge of EDGES) element.style[edge] = overrides[edge] ?? '';
      }

      for (const element of patched) {
        if (seen.has(element)) continue;
        clearElement(element);
        patched.delete(element);
      }
    } catch (error) {
      reportBoardProblem('chrome-sync', error);
    }
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(apply);
  };

  const onMutations = (records: MutationRecord[]) => {
    if (records.length > 0 && records.every((record) => isInsideBoard(record.target))) return;
    schedule();
  };

  apply();
  const observer = new MutationObserver(onMutations);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class'],
  });

  return () => {
    observer.disconnect();
    if (frame) cancelAnimationFrame(frame);
    clear();
  };
}
