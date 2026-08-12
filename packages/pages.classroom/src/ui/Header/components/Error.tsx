import { useTranslation } from 'react-i18next';
import { classroomPageTitleClass } from '../../sectionTitleClass';

export const Error = () => {
  const { t } = useTranslation('classroom');

  return (
    <div className="flex w-full shrink-0 flex-col gap-4 px-5 pt-5 sm:px-8 sm:pt-8 md:px-10 md:pt-10">
      <h1 className={classroomPageTitleClass}>{t('errors.classroomNotFound')}</h1>
    </div>
  );
};
