import { useTranslation } from 'react-i18next';

export const ErrorState = () => {
  const { t } = useTranslation('classroom');

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-text-primary text-xl font-medium">{t('errors.loadData')}</h2>
      <p className="text-text-primary">{t('errors.classroomMaterials')}</p>
    </div>
  );
};
