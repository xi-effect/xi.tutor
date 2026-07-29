import { Button } from '@xipkg/button';
import { useEffect, useState } from 'react';
import { collectTechnicalInfo, formatReport, ReportSection } from '../utils';
import { toast } from 'sonner';
import { Copy } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';

interface TechnicalReportBodyProps {
  isMobile: boolean;
  /** Опционально: buildId, version, gitSha для секции «Приложение» в отчёте */
  app?: { buildId?: string; version?: string; gitSha?: string };
}

export const TechnicalReportBody = ({ isMobile, app }: TechnicalReportBodyProps) => {
  const { t, i18n } = useTranslation('profile');
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInfo = async () => {
      setIsLoading(true);
      try {
        const reportSections = await collectTechnicalInfo({ app });
        setSections(reportSections);
      } catch (error) {
        console.error('Ошибка при сборе технической информации:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInfo();
  }, [app, i18n.language]);

  const handleCopy = async () => {
    try {
      const reportText = formatReport(sections);
      await navigator.clipboard.writeText(reportText);
      toast.success(t('report.copied'));
    } catch (error) {
      console.error('Ошибка при копировании:', error);
      toast.error(t('report.copyFailed'));
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl">
      <div className="flex items-center justify-between">
        <h2 className="dark:text-text-primary text-lg font-semibold">
          {t('report.technicalInfo')}
        </h2>
        <Button
          onClick={handleCopy}
          disabled={isLoading || sections.length === 0}
          className="flex gap-2 sm:w-auto"
          size="s"
        >
          <span className={isMobile ? 'hidden' : ''}>{t('report.copy')}</span>
          <Copy className="h-3 w-3 fill-white" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-text-primary dark:text-text-primary">{t('report.loading')}</p>
        </div>
      ) : sections.length > 0 ? (
        <div className="bg-background-page rounded-2xl p-4">
          {sections.map(({ title, data }, index) => (
            <div key={index} className="mb-4 last:mb-0">
              {title && (
                <h3 className="text-text-primary dark:text-text-primary mb-2 font-semibold">
                  {title}
                </h3>
              )}
              <div className="text-text-primary dark:text-text-primary font-mono text-xs">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="mb-1 wrap-break-word">
                    <span className="font-semibold">{key}:</span>{' '}
                    <span className="break-all">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <p className="text-text-primary dark:text-text-primary">{t('report.loadFailed')}</p>
        </div>
      )}
    </div>
  );
};
