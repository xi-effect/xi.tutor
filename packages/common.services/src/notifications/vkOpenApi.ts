const VK_OPEN_API_SCRIPT_URL = 'https://vk.com/js/api/openapi.js?169';
const VK_OPEN_API_SCRIPT_SELECTOR = 'script[data-vk-openapi]';

declare global {
  interface Window {
    VK?: {
      Widgets: {
        AllowMessagesFromCommunity: (
          elementId: string,
          options: { height: number; key: string },
          communityId: number,
        ) => void;
      };
    };
  }
}

let loadPromise: Promise<void> | null = null;
let renderQueue: Promise<void> = Promise.resolve();

export const VK_ALLOW_MESSAGES_WIDGET_HEIGHT = 30;

export function loadVkOpenApi(): Promise<void> {
  if (typeof window !== 'undefined' && window.VK?.Widgets) {
    return Promise.resolve();
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(VK_OPEN_API_SCRIPT_SELECTOR);

      if (existingScript) {
        if (window.VK?.Widgets) {
          resolve();
          return;
        }

        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener(
          'error',
          () => reject(new Error('Не удалось загрузить VK Open API')),
          { once: true },
        );
        return;
      }

      const script = document.createElement('script');
      script.src = VK_OPEN_API_SCRIPT_URL;
      script.async = true;
      script.dataset.vkOpenapi = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Не удалось загрузить VK Open API'));
      document.body.appendChild(script);
    });
  }

  return loadPromise;
}

export async function renderVkAllowMessagesWidget({
  elementId,
  communityId,
  connectionKey,
}: {
  elementId: string;
  communityId: number;
  connectionKey: string;
}) {
  const run = async () => {
    await loadVkOpenApi();

    const container = document.getElementById(elementId);
    if (!container) return;

    container.innerHTML = '';

    window.VK?.Widgets?.AllowMessagesFromCommunity(
      elementId,
      { height: VK_ALLOW_MESSAGES_WIDGET_HEIGHT, key: connectionKey },
      communityId,
    );
  };

  renderQueue = renderQueue.then(run, run);
  await renderQueue;
}

export function clearVkAllowMessagesWidget(elementId: string) {
  const container = document.getElementById(elementId);
  if (container) {
    container.innerHTML = '';
  }
}
