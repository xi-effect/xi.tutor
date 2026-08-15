import { useTranslation } from 'react-i18next';
import { ErrorPage } from './ErrorPage';

type NotFoundPageProps = {
  withLogo?: boolean;
};

export const NotFoundPage = ({ withLogo = true }: NotFoundPageProps) => {
  const { t } = useTranslation('commonUi');

  return (
    <ErrorPage
      withLogo={withLogo}
      title={t('errorPage.notFoundTitle')}
      errorCode={404}
      text={t('errorPage.notFoundText')}
    />
  );
};
