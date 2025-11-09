import { useState, useEffect } from 'react';
import { useMediaQuery } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { toast } from 'sonner';
import { Copy } from '@xipkg/icons';
import {
  collectTechnicalInfo,
  formatReport,
  type ReportSection,
} from '../utils/collectTechnicalInfo';

export const TechnicalReport = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');
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
    <>
      {!isMobile && <h1 className="mb-4 text-3xl font-semibold dark:text-gray-100">Отчёт</h1>}

      <div className="flex flex-col gap-4">
        <div className="border-gray-30 flex w-full flex-col gap-4 rounded-2xl border p-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold dark:text-gray-100">Что это такое?</h2>
            <p className="text-gray-80 dark:text-gray-80 text-sm">
              На этой странице собрана техническая информация о вашем браузере и устройстве. Эта
              информация помогает команде поддержки Sovlium быстрее находить и исправлять проблемы.
            </p>
            <div className="border-gray-30 bg-gray-5 rounded-lg border p-3">
              <p className="text-gray-80 dark:text-gray-80 mb-2 text-sm font-semibold">
                Важная информация о конфиденциальности:
              </p>
              <ul className="text-gray-80 dark:text-gray-80 list-inside list-disc space-y-1 text-xs">
                <li>Отчёт содержит техническую информацию о вашем браузере и устройстве</li>
                <li>Передавайте отчёт только официальной поддержке Sovlium</li>
                <li>
                  Используя эту функцию, вы соглашаетесь на сбор и передачу технической информации в
                  службу поддержки
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-gray-30 flex w-full flex-col gap-4 rounded-2xl border p-4">
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
          <div className="min-h-150 w-full overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-80 dark:text-gray-80">Загрузка информации...</p>
              </div>
            ) : sections.length > 0 ? (
              <div className="bg-gray-5 max-h-150 w-full overflow-y-scroll rounded-lg p-4">
                {sections.map(({ title, data }, index) => (
                  <div key={index} className="mb-4 w-full last:mb-0">
                    {title && (
                      <h3 className="text-gray-90 mb-2 font-semibold dark:text-gray-100">
                        {title}
                      </h3>
                    )}
                    <div className="text-gray-80 dark:text-gray-80 w-full font-mono text-xs">
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
                <p className="text-gray-80 dark:text-gray-80">Не удалось загрузить информацию</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
