import { Button } from '@xipkg/button';
import { useEffect, useState } from 'react';
import { collectTechnicalInfo, formatReport, ReportSection } from '../utils';
import { toast } from 'sonner';
import { Copy } from '@xipkg/icons';

interface TechnicalReportBodyProps {
  isMobile: boolean;
}

export const TechnicalReportBody = ({ isMobile }: TechnicalReportBodyProps) => {
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInfo = async () => {
      setIsLoading(true);
      try {
        const reportSections = await collectTechnicalInfo();
        setSections(reportSections);
      } catch (error) {
        console.error('Ошибка при сборе технической информации:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInfo();
  }, []);

  const handleCopy = async () => {
    try {
      const reportText = formatReport(sections);
      await navigator.clipboard.writeText(reportText);
      toast.success('Скопировано');
    } catch (error) {
      console.error('Ошибка при копировании:', error);
      toast.error('Не удалось скопировать');
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-gray-100">Техническая информация</h2>
        <Button
          onClick={handleCopy}
          disabled={isLoading || sections.length === 0}
          className="flex gap-2 sm:w-auto"
          size="s"
        >
          <span className={isMobile ? 'hidden' : ''}>Скопировать</span>
          <Copy className="h-3 w-3 fill-white" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-80 dark:text-gray-80">Загрузка информации...</p>
        </div>
      ) : sections.length > 0 ? (
        <div className="bg-gray-5 rounded-2xl p-4">
          {sections.map(({ title, data }, index) => (
            <div key={index} className="mb-4 last:mb-0">
              {title && (
                <h3 className="text-gray-90 mb-2 font-semibold dark:text-gray-100">{title}</h3>
              )}
              <div className="text-gray-80 dark:text-gray-80 font-mono text-xs">
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
          <p className="text-gray-80 dark:text-gray-80">Не удалось получить информацию</p>
        </div>
      )}
    </div>
  );
};
