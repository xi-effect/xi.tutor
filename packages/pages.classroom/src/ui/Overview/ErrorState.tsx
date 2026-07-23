import { Button } from '@xipkg/button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-text-primary text-xl font-medium">Ошибка загрузки данных</h2>
    <div className="flex items-center gap-2">
      <p className="text-text-primary">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} className="text-m-base w-48" variant="none" size="m">
          Попробовать снова
        </Button>
      )}
    </div>
  </div>
);
