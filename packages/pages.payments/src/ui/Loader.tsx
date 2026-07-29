import { useTranslation } from 'react-i18next';

export type LoaderPropsT = {
  isLoading: boolean;
  isFetchingNextPage: boolean;
};

export const Loader = ({ isLoading, isFetchingNextPage }: LoaderPropsT) => {
  const { t } = useTranslation('payments');

  if (!isLoading && !isFetchingNextPage) {
    return null;
  }

  return (
    <div className="flex justify-center py-4">
      <div className="text-text-secondary">{t('loader')}</div>
    </div>
  );
};
