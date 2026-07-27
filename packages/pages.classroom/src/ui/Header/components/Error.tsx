import { useTranslation } from 'react-i18next';

export const Error = () => {
  const { t } = useTranslation('classroom');

  return (
    <div className="flex flex-row items-center px-5 pt-5 sm:px-10 sm:pt-10">
      <div className="flex flex-col items-start gap-1">
        <div className="text-m-base text-text-primary font-medium">
          {t('errors.classroomNotFound')}
        </div>
      </div>
    </div>
  );
};
