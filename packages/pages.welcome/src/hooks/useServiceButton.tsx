import { Button } from '@xipkg/button';
import { Check } from '@xipkg/icons';

interface UseServiceButtonProps {
  service: string;
  isConnected?: boolean;
  isPending?: boolean;
  link?: string | null;
  createConnection?: () => void;
}

export function useServiceButton({
  service,
  isConnected = false,
  isPending = false,
  link = null,
  createConnection,
}: UseServiceButtonProps) {
  if (isConnected) {
    return (
      <div className="ml-auto p-1 sm:p-3">
        <Check className="fill-brand-100" />
      </div>
    );
  }

  if (isPending) {
    return <div className="text-gray-60 ml-auto py-1 sm:py-3">Формируем ссылку…</div>;
  }

  if (link) {
    return (
      <Button
        variant="none"
        className="text-s-base text-brand-100 ml-auto h-8 px-4 py-1.5 sm:h-12"
        onClick={() => window.open(link, '_blank')}
        data-umami-event="service-external-link"
        data-umami-event-service={service}
        data-umami-event-url={link}
      >
        Перейти в {service}
      </Button>
    );
  }

  return (
    <Button
      variant="none"
      className="text-s-base text-brand-100 ml-auto h-8 px-4 py-1.5 sm:h-12"
      onClick={createConnection}
      data-umami-event="service-connect"
      data-umami-event-service={service}
    >
      Подключить
    </Button>
  );
}
