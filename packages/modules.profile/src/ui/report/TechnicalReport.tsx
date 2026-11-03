import { useMediaQuery } from '@xipkg/utils';
import { TechnicalReportHeader } from './TechnicalReportHeader';
import { TechnicalReportBody } from './TechnicalReportBody';

export const TechnicalReport = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  return (
    <>
      <div className="border-border-control flex flex-col gap-6 rounded-2xl border p-4 md:p-6">
        <TechnicalReportHeader />
        <TechnicalReportBody isMobile={isMobile} />
      </div>
    </>
  );
};
