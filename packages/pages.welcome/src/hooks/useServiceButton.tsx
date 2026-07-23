import { Button } from '@xipkg/button';
import { Check } from '@xipkg/icons';

interface UseServiceButtonProps {
  service: string;
  isConnected?: boolean;
  isPending?: boolean;
  isAwaitingConfirmation?: boolean;
  link?: string | null;
  createConnection?: () => void;
  openLink?: () => void;
}

export function useServiceButton({
  service,
  isConnected = false,
  isPending = false,
  isAwaitingConfirmation = false,
  link = null,
  createConnection,
  openLink,
}: UseServiceButtonProps) {
  if (isConnected) {
    return (
      <div className="ml-auto p-1 sm:p-3">
        <Check className="fill-brand-100" />
      </div>
    );
  }

  if (isPending && !link) {
    return (
      <div className="text-gray-60 dark:text-gray-80 ml-auto inline-flex h-8 items-center">
        Формируем ссылку…
      </div>
    );
  }

  if (isAwaitingConfirmation || link) {
    return (
      <Button
        variant="none"
        className="text-s-base text-brand-100 ml-auto h-8 px-2 py-0"
        onClick={() => {
          if (openLink) {
            openLink();
            return;
          }
          if (link) window.open(link, '_blank');
        }}
        data-umami-event="service-external-link"
        data-umami-event-service={service}
        data-umami-event-url={link ?? undefined}
      >
        {isAwaitingConfirmation ? 'Ожидаем…' : `Перейти в ${service}`}
      </Button>
    );
  }

  return (
    <Button
      variant="none"
      className="text-s-base text-brand-100 ml-auto h-8 px-2 py-0"
      onClick={createConnection}
      data-umami-event="service-connect"
      data-umami-event-service={service}
    >
      Подключить
    </Button>
  );
}
