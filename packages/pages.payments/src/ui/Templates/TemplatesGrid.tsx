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
const GRID_SCROLL_CLASS = 'min-h-0 flex-1 overflow-auto py-1 -ml-2 pl-2 pr-5';

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
      <div
        className={cn(
          GRID_SCROLL_CLASS,
          isMobile && 'h-[calc(100dvh-204px)]',
          !isMobile && 'h-[calc(100dvh-190px)]',
        )}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-background-surface flex h-40 w-full flex-col justify-between rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]"
            >
              <div className="flex w-full items-start justify-between">
                <div className="bg-background-subtle size-10 animate-pulse rounded-[10px]" />
                <div className="bg-background-subtle size-8 animate-pulse rounded-lg" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="bg-background-subtle h-5 w-3/4 animate-pulse rounded" />
                <div className="bg-background-subtle h-4 w-20 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
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
            <EmptyPaymentsFull className="h-auto max-h-[200px] w-auto max-w-[240px] object-contain" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn(
        GRID_SCROLL_CLASS,
        isMobile && 'h-[calc(100dvh-204px)]',
        !isMobile && 'h-[calc(100dvh-190px)]',
      )}
    >
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
  );
};
