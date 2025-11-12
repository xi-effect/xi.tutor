import { useMediaQuery } from '@xipkg/utils';
import { TechnicalReportHeader } from './TechnicalReportHeader';
import { TechnicalReportBody } from './TechnicalReportBody';

export const TechnicalReport = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  return (
    <>
      {!isMobile && <h1 className="mb-4 text-3xl font-semibold dark:text-gray-100">Отчёт</h1>}

      <div className="border-gray-30 flex max-h-full flex-col gap-4 overflow-y-scroll rounded-2xl border p-4 sm:max-h-150 md:p-6">
        <TechnicalReportHeader />
        <TechnicalReportBody isMobile={isMobile} />
      </div>
    </>
  );
};
