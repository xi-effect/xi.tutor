import { useMediaQuery } from '@xipkg/utils';
import { TechnicalReportHeader } from './TechnicalReportHeader';
import { TechnicalReportBody } from './TechnicalReportBody';

export const TechnicalReport = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  return (
    <>
      <div className="border-border-control flex max-h-full flex-col gap-4 overflow-y-scroll rounded-2xl border p-4 sm:max-h-150 md:p-6">
        <TechnicalReportHeader />
        <TechnicalReportBody isMobile={isMobile} />
      </div>
    </>
  );
};
