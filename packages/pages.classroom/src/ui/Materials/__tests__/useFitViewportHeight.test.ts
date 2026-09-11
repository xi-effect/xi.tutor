import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { observeFitHeight } from '../useFitViewportHeight';

type FakeStyle = Pick<
  CSSStyleDeclaration,
  'overflowY' | 'overflowX' | 'paddingBottom' | 'borderBottomWidth'
>;

const VISIBLE_STYLE: FakeStyle = {
  overflowY: 'visible',
  overflowX: 'visible',
  paddingBottom: '0px',
  borderBottomWidth: '0px',
};

/** Стили конкретных фейковых узлов — getComputedStyle-стаб ищет по этой карте. */
const styles = new WeakMap<object, FakeStyle>();

function makeEl(options: {
  top?: number;
  bottom?: number;
  parentElement?: HTMLElement | null;
  previousElementSibling?: HTMLElement | null;
  style?: FakeStyle;
}): HTMLElement {
  const el = {
    parentElement: options.parentElement ?? null,
    previousElementSibling: options.previousElementSibling ?? null,
    getBoundingClientRect: () =>
      ({ top: options.top ?? 0, bottom: options.bottom ?? 0 }) as DOMRect,
  } as unknown as HTMLElement;

  styles.set(el, options.style ?? VISIBLE_STYLE);
  return el;
}

class FakeResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

let resizeObserverInstances: FakeResizeObserver[] = [];
let windowListeners: Record<string, ReturnType<typeof vi.fn>>;
let visualViewportListeners: Record<string, ReturnType<typeof vi.fn>>;

beforeEach(() => {
  resizeObserverInstances = [];

  vi.stubGlobal(
    'ResizeObserver',
    class extends FakeResizeObserver {
      constructor() {
        super();
        resizeObserverInstances.push(this);
      }
    },
  );

  vi.stubGlobal('getComputedStyle', (node: object) => ({
    ...(styles.get(node) ?? VISIBLE_STYLE),
    // --calls-layout-bottom-offset не задан ни у одного фейкового узла в тестах
    getPropertyValue: () => '',
  }));
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());

  windowListeners = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
  visualViewportListeners = { addEventListener: vi.fn(), removeEventListener: vi.fn() };

  vi.stubGlobal('window', {
    innerHeight: 800,
    visualViewport: visualViewportListeners,
    addEventListener: windowListeners.addEventListener,
    removeEventListener: windowListeners.removeEventListener,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('observeFitHeight', () => {
  it('на очистке отключает ResizeObserver и снимает слушатели window/visualViewport', () => {
    const el = makeEl({ top: 100 });
    const onChange = vi.fn();

    const cleanup = observeFitHeight(el, onChange);

    expect(resizeObserverInstances).toHaveLength(1);
    expect(resizeObserverInstances[0].observe).toHaveBeenCalledWith(el);
    expect(windowListeners.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(visualViewportListeners.addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );

    cleanup();

    expect(resizeObserverInstances[0].disconnect).toHaveBeenCalledTimes(1);
    expect(windowListeners.removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
    expect(visualViewportListeners.removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
  });

  it('наблюдает предыдущего соседа (шапку) и предков, обрезающих по вертикали', () => {
    const clippingAncestor = makeEl({
      bottom: 700,
      style: { ...VISIBLE_STYLE, overflowY: 'hidden' },
    });
    // overflow-x-auto без overflow-y — не граница по высоте (регрессия на баг из ревью).
    const horizontalScroller = makeEl({
      parentElement: clippingAncestor,
      style: { ...VISIBLE_STYLE, overflowX: 'auto' },
    });
    const header = makeEl({ top: 0, bottom: 40 });
    const el = makeEl({
      top: 40,
      parentElement: horizontalScroller,
      previousElementSibling: header,
    });

    observeFitHeight(el, vi.fn());

    const observedNodes = resizeObserverInstances[0].observe.mock.calls.map(([node]) => node);
    expect(observedNodes).toContain(el);
    expect(observedNodes).toContain(header);
    expect(observedNodes).toContain(clippingAncestor);
    expect(observedNodes).not.toContain(horizontalScroller);
  });

  it('считает высоту от top элемента до низа ближайшего клиппящего предка (за вычетом его padding)', () => {
    const clippingAncestor = makeEl({
      bottom: 700,
      style: { ...VISIBLE_STYLE, overflowY: 'hidden', paddingBottom: '20px' },
    });
    const el = makeEl({ top: 40, parentElement: clippingAncestor });
    const onChange = vi.fn();

    observeFitHeight(el, onChange);

    // 700 (bottom предка) - 20 (paddingBottom) - 40 (top el) = 640
    expect(onChange).toHaveBeenCalledWith(640);
  });

  it('складывает --calls-layout-bottom-offset и --classroom-fab-offset (оба вне DOM-цепочки)', () => {
    vi.stubGlobal('getComputedStyle', (node: object) => ({
      ...(styles.get(node) ?? VISIBLE_STYLE),
      getPropertyValue: (prop: string) => {
        if (prop === '--calls-layout-bottom-offset') return '64px';
        if (prop === '--classroom-fab-offset') return '100px';
        return '';
      },
    }));

    const el = makeEl({ top: 0 });
    const onChange = vi.fn();

    observeFitHeight(el, onChange);

    // innerHeight(800) - 64 (нижняя панель) - 100 (FAB) - top(0) = 636
    expect(onChange).toHaveBeenCalledWith(636);
  });
});
