import { Alert, AlertContainer, AlertDescription, AlertIcon, AlertTitle } from '@xipkg/alert';
import { InfoCircle } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';

export const TechnicalReportHeader = () => {
  const { t } = useTranslation('profile');

  return (
    <div className="flex flex-col gap-4 rounded-2xl">
      <h2 className="dark:text-text-primary text-xl font-semibold">{t('report.whatIsThis')}</h2>
      <p className="text-text-primary dark:text-text-primary text-sm">{t('report.description')}</p>
      <Alert variant="brand" className="w-full max-w-full">
        <AlertIcon className="hidden md:block">
          <InfoCircle />
        </AlertIcon>
        <AlertContainer>
          <AlertTitle className="text-base">{t('report.privacyTitle')}</AlertTitle>
          <AlertDescription>
            <ul className="text-text-primary dark:text-text-primary list-inside list-disc space-y-1 text-xs">
              <li>{t('report.privacyItem1')}</li>
              <li>{t('report.privacyItem2')}</li>
              <li>{t('report.privacyItem3')}</li>
            </ul>
          </AlertDescription>
        </AlertContainer>
      </Alert>
    </div>
  );
};
