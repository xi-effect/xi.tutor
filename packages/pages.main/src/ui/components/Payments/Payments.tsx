import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { Add, ArrowRight, ArrowUpRight } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { SectionEmptyState } from '../SectionEmptyState';
import { sectionEmptyStateIllustrationClass } from '../sectionEmptyStateIllustrationClass';
import { WidgetHeader } from '../WidgetHeader';
import { galleryShadowHeaderInsetClass } from '../galleryShadowClass';
import { WidgetCardsCarousel, widgetCardSlotClass } from '../WidgetCardsCarousel';
import {
  useCurrentUser,
  useGetTutorPaymentsList,
  useGetStudentPaymentsList,
} from 'common.services';
import { InvoiceModal } from 'features.invoice';
import { InvoiceCard } from 'features.invoice.card';
import { EmptyPayments } from 'common.ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@xipkg/utils';
import { useCallStore } from 'modules.calls';
import { PaymentCardSkeleton } from './PaymentCardSkeleton';
import { FORCE_MAIN_LISTS_LOADING, MAIN_LIST_SKELETON_COUNT } from '../../forceListsLoading';

const PAYMENTS_PREVIEW_LIMIT = 10;

/** База знаний (как в сайдбаре «Справка») */
const PAYMENTS_HELP_URL = 'https://support.sovlium.ru/payments';

const galleryInvoiceCardClass =
  'h-[156px] w-full min-w-0 flex-none bg-background-surface border-0 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.1)] hover:border-transparent';

export const Payments = () => {
  const { t } = useTranslation('main');
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const isMobile = useMediaQuery('(max-width: 960px)');
  const isStarted = useCallStore((state) => state.isStarted);

  const { data: tutorPayments, isLoading: isLoadingTutor } = useGetTutorPaymentsList({
    disabled: !isTutor,
  });
  const { data: studentPayments, isLoading: isLoadingStudent } = useGetStudentPaymentsList({
    disabled: isTutor,
  });

  const payments = isTutor ? tutorPayments : studentPayments;
  const isLoading = FORCE_MAIN_LISTS_LOADING || (isTutor ? isLoadingTutor : isLoadingStudent);
  const previewList = (payments ?? []).slice(0, PAYMENTS_PREVIEW_LIMIT);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const handleMore = () => {
    const filteredSearch = isStarted && search.call ? { call: search.call } : {};
    navigate({
      to: '/payments',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...filteredSearch,
      }),
    });
  };

  const handleAdd = () => {
    setInvoiceModalOpen(true);
  };

  const openPaymentsHelp = () => {
    window.open(PAYMENTS_HELP_URL, '_blank', 'noopener,noreferrer');
  };

  const emptyActionButtonClass =
    'bg-background-page hover:bg-background-subtle text-xs-base-size flex h-8 items-center rounded-lg px-4 font-medium text-text-primary';

  const headerActions =
    isTutor && !isMobile ? (
      <Button
        variant="primary"
        className="flex size-10 items-center justify-center rounded-[10px] p-0"
        onClick={handleAdd}
        data-umami-event="create-invoice-button"
        id="create-invoice-button"
      >
        <Add className="fill-text-on-accent size-6" />
      </Button>
    ) : (
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            variant="none"
            className="hover:bg-background-subtle flex size-8 items-center justify-center rounded-lg p-0"
            onClick={handleMore}
            data-umami-event="payments-more"
          >
            <ArrowRight className="fill-icon-secondary size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('payments.toPayments')}</TooltipContent>
      </Tooltip>
    );

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className={galleryShadowHeaderInsetClass}>
        <WidgetHeader title={t('payments.title')} actions={headerActions} isMobile={isMobile} />
      </div>
      <InvoiceModal open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen} />

      {isLoading ? (
        <WidgetCardsCarousel>
          {Array.from({ length: MAIN_LIST_SKELETON_COUNT }).map((_, i) => (
            <div key={i} className={widgetCardSlotClass}>
              <PaymentCardSkeleton />
            </div>
          ))}
        </WidgetCardsCarousel>
      ) : previewList.length > 0 ? (
        <WidgetCardsCarousel>
          {previewList.map((payment) => (
            <div key={payment.id} className={widgetCardSlotClass}>
              <InvoiceCard
                payment={payment}
                currentUserRole={isTutor ? 'tutor' : 'student'}
                withoutPaymentType
                className={galleryInvoiceCardClass}
              />
            </div>
          ))}
        </WidgetCardsCarousel>
      ) : isTutor ? (
        <SectionEmptyState
          title={t('payments.emptyTitle')}
          description={t('payments.emptyTutorDescription')}
          minHeightClass="min-h-[160px]"
          illustration={<EmptyPayments className={sectionEmptyStateIllustrationClass} />}
          actions={
            <>
              <Button
                type="button"
                variant="none"
                className={emptyActionButtonClass}
                onClick={openPaymentsHelp}
                data-umami-event="payments-empty-help"
              >
                {t('payments.howItWorks')}
                <ArrowUpRight className="fill-icon-primary ml-1 size-4 shrink-0" />
              </Button>
              {!isMobile && (
                <Button
                  type="button"
                  variant="none"
                  className={emptyActionButtonClass}
                  onClick={handleAdd}
                  data-umami-event="payments-empty-invoice"
                >
                  {t('payments.createInvoice')}
                  <Add className="fill-icon-primary ml-1 size-4 shrink-0" />
                </Button>
              )}
            </>
          }
        />
      ) : (
        <SectionEmptyState
          title={t('payments.emptyStudentTitle')}
          description={t('payments.emptyStudentDescription')}
          minHeightClass="min-h-[160px]"
          illustration={<EmptyPayments className={sectionEmptyStateIllustrationClass} />}
          actions={
            <Button
              type="button"
              variant="none"
              className={emptyActionButtonClass}
              onClick={handleMore}
              data-umami-event="payments-empty-more"
            >
              {t('payments.moreAboutFinance')}
              <ArrowUpRight className="fill-icon-primary ml-1 size-4 shrink-0" />
            </Button>
          }
        />
      )}
    </div>
  );
};
