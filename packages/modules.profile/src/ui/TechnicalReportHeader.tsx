import { Alert, AlertContainer, AlertDescription, AlertIcon, AlertTitle } from '@xipkg/alert';
import { InfoCircle } from '@xipkg/icons';

export const TechnicalReportHeader = () => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl">
      <h2 className="text-xl font-semibold dark:text-gray-100">Что это такое?</h2>
      <p className="text-gray-80 dark:text-gray-80 text-sm">
        На этой странице собрана техническая информация о вашем браузере и устройстве. Эта
        информация помогает команде поддержки Sovlium быстрее находить и исправлять проблемы.
      </p>
      <Alert variant="info" className="border-gray-30 w-full max-w-full rounded-lg border">
        <AlertIcon className="hidden md:block">
          <InfoCircle />
        </AlertIcon>
        <AlertContainer>
          <AlertTitle className="text-base">Важная информация о конфиденциальности:</AlertTitle>
          <AlertDescription>
            <ul className="text-gray-80 dark:text-gray-80 list-inside list-disc space-y-1 text-xs">
              <li>Отчёт содержит техническую информацию о вашем браузере и устройстве</li>
              <li>Передавайте отчёт только официальной поддержке Sovlium</li>
              <li>
                Используя эту функцию, вы соглашаетесь на сбор и передачу технической информации в
                службу поддержки
              </li>
            </ul>
          </AlertDescription>
        </AlertContainer>
      </Alert>
    </div>
  );
};
