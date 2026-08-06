import { useRef } from 'react';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { cn, useMediaQuery } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { ArrowUpRight } from '@xipkg/icons';
import { EmptyPaymentsFull } from 'common.ui';
import { TemplateCard } from './TemplateCard';
import { useTemplatesList, useDeleteTemplate } from 'common.services';
import { TemplateT } from 'common.types';
import { useTranslation } from 'react-i18next';

/** База знаний — как в журнале оплат */
const PAYMENTS_HELP_URL = 'https://support.sovlium.ru/payments';

const emptyTemplatesHelpLinkClass =
  'bg-background-page hover:bg-background-subtle text-xs-base h-8 rounded-lg px-4 font-medium text-text-primary';

const SHELL_HEIGHT = 'h-[calc(100dvh-140px)]';

export const TemplatesGrid = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { t } = useTranslation('payments');
  const { data, isLoading, isError } = useTemplatesList();
  const { mutate: deleteTemplateMutation, isPending: isDeletingTemplate } = useDeleteTemplate();

  const handleDeleteTemplate = (id: number, onSuccess?: () => void) => {
    deleteTemplateMutation(id, { onSuccess });
  };

  const templates = data ?? [];
  const isEmpty = !isLoading && !isError && templates.length === 0;

  if (isLoading) {
    return (
      <div className={cn('flex w-full items-center justify-center', SHELL_HEIGHT)}>
        <p className="text-text-secondary">{t('loader')}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        className={cn('box-border flex w-full flex-col px-5 pb-5 sm:px-10 sm:pb-10', SHELL_HEIGHT)}
      >
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-hidden',
            'px-6 py-10 sm:gap-10 sm:px-8 sm:py-12',
          )}
        >
          <div className="flex max-w-md flex-col gap-2 text-center">
            <p className="text-l-base text-text-primary font-semibold">
              {t('empty.templatesTitle')}
            </p>
            <p className="text-s-base text-text-secondary dark:text-text-muted">
              {t('empty.templatesDescription')}
            </p>
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="none"
                className={emptyTemplatesHelpLinkClass}
                onClick={() => window.open(PAYMENTS_HELP_URL, '_blank', 'noopener,noreferrer')}
                data-umami-event="payments-templates-empty-help"
              >
                {t('empty.helpLink')}
                <ArrowUpRight className="fill-icon-primary ml-1 size-4 shrink-0" />
              </Button>
            </div>
          </div>
          <div className="flex w-full shrink-0 justify-center px-2" aria-hidden>
            <EmptyPaymentsFull className="h-auto max-h-[min(42vh,360px)] w-full max-w-[min(92vw,420px)] object-contain sm:max-h-[min(48vh,400px)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-0 flex-1 overflow-auto pr-5',
        isMobile && 'h-[calc(100dvh-204px)]',
        !isMobile && 'h-[calc(100dvh-190px)]',
      )}
    >
      <div ref={parentRef}>
        <GridVirtualizer
          parentRef={parentRef}
          items={templates}
          defaultRowHeight={160}
          minItemWidth={300}
          gap={20}
          maxColumns={4}
          isSingleColumn={isMobile}
          renderItem={(item: TemplateT) => (
            <TemplateCard
              {...item}
              handleDeleteTemplate={handleDeleteTemplate}
              isDeleting={isDeletingTemplate}
            />
          )}
        />
      </div>
    </div>
  );
};
