import { useRef } from 'react';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { cn, useMediaQuery } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { ArrowUpRight } from '@xipkg/icons';
import {
  EmptyPaymentsFull,
  PageEmptyState,
  pageEmptyActionButtonClass,
  pageEmptyIllustrationClass,
} from 'common.ui';
import { TemplateCard } from './TemplateCard';
import { useTemplatesList, useDeleteTemplate } from 'common.services';
import { TemplateT } from 'common.types';
import { useTranslation } from 'react-i18next';

/** База знаний — как в журнале оплат */
const PAYMENTS_HELP_URL = 'https://support.sovlium.ru/payments';

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
      <div className={cn(GRID_SCROLL_CLASS, isMobile ? 'h-full' : 'h-[calc(100dvh-190px)]')}>
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
      <PageEmptyState
        title={t('empty.templatesTitle')}
        description={t('empty.templatesDescription')}
        actions={
          <Button
            type="button"
            variant="none"
            className={pageEmptyActionButtonClass}
            onClick={() => window.open(PAYMENTS_HELP_URL, '_blank', 'noopener,noreferrer')}
            data-umami-event="payments-templates-empty-help"
          >
            {t('empty.helpLink')}
            <ArrowUpRight className="fill-icon-primary ml-1 size-4 shrink-0" />
          </Button>
        }
        illustration={<EmptyPaymentsFull className={pageEmptyIllustrationClass} />}
      />
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn(GRID_SCROLL_CLASS, isMobile ? 'h-full' : 'h-[calc(100dvh-190px)]')}
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
