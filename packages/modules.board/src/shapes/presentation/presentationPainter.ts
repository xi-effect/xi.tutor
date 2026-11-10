import type { RenderOptions } from 'pptxviewjs';

type Paint = {
  width: number;
  height: number;
  pixelWidth: number;
  pixelHeight: number;
  page: number;
};
/** Serial rendering: pending requests collapse to the latest, stale frames never reach the screen. */
export function createPresentationPainter(
  viewer: {
    render: (canvas: HTMLCanvasElement, options: RenderOptions) => Promise<unknown>;
    destroy: () => void;
  },
  target: HTMLCanvasElement,
  onCommit: (page: number) => void,
  onError: (error: unknown) => void,
) {
  let latest: Paint | undefined;
  let recent: Paint | undefined;
  let chartRefresh: ReturnType<typeof setTimeout> | undefined;
  let refreshed = false;
  let lastKey = '';
  let running = false;
  let disposed = false;
  let destroyed = false;
  const destroy = () => {
    if (!destroyed) {
      destroyed = true;
      viewer.destroy();
    }
  };
  async function drain() {
    running = true;
    try {
      while (latest && !disposed) {
        const request = latest;
        const buffer = document.createElement('canvas');
        buffer.width = request.pixelWidth;
        buffer.height = request.pixelHeight;
        try {
          await viewer.render(buffer, { quality: 'high', slideIndex: request.page - 1 });
          if (!disposed && latest === request) {
            target.width = buffer.width;
            target.height = buffer.height;
            target.getContext('2d')?.drawImage(buffer, 0, 0);
            target.style.width = `${request.width}px`;
            target.style.height = `${request.height}px`;
            onCommit(request.page);
            // Preserve the library's post-load chart refresh, through the same serial queue.
            if (!refreshed) {
              refreshed = true;
              chartRefresh = setTimeout(() => {
                if (disposed || !recent) return;
                lastKey = '';
                latest = recent;
                if (!running) void drain();
              }, 200);
            }
          }
        } catch (error) {
          if (!disposed && latest === request) {
            lastKey = '';
            onError(error);
          }
        } finally {
          buffer.width = 0;
          buffer.height = 0;
        }
        if (latest === request) latest = undefined;
      }
    } finally {
      running = false;
      if (disposed) destroy();
    }
  }
  return {
    request(paint: Paint) {
      if (disposed) return;
      const key = JSON.stringify(paint);
      if (key === lastKey) return;
      recent = paint;
      lastKey = key;
      latest = paint;
      if (!running) void drain();
    },
    dispose() {
      disposed = true;
      clearTimeout(chartRefresh);
      latest = undefined;
      if (!running) destroy();
    },
  };
}
