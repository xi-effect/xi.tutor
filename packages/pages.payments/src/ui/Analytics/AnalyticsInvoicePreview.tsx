import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { StatusBadge } from 'features.invoice.card';
import { formatMoney } from 'features.charts';
import { getDateLocale } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils';
import type { AnalyticsAttentionItemT } from './types';

type AnalyticsInvoicePreviewProps = {
  item: AnalyticsAttentionItemT | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export const AnalyticsInvoicePreview = ({
  item,
  open,
  onOpenChange,
}: AnalyticsInvoicePreviewProps) => {
  const { t } = useTranslation('payments');
  const locale = getDateLocale();

  if (!item) return null;

  const paymentTypeLabel =
    item.paymentType === 'cash'
      ? t('invoiceModal.paymentTypeCash')
      : t('invoiceModal.paymentTypeTransfer');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="relative flex max-h-[90dvh] w-[calc(100vw-32px)] max-w-[960px] flex-col overflow-y-auto max-sm:max-h-[calc(100dvh-32px)] sm:overflow-hidden">
        <Button
          type="button"
          variant="none"
          size="icon"
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full p-0 sm:top-6 sm:right-6"
          onClick={() => onOpenChange(false)}
          aria-label={t('invoiceModal.closeAria')}
        >
          <Close className="fill-icon-primary h-5 w-5" />
        </Button>

        <ModalHeader className="border-0 p-4 sm:p-6">
          <ModalTitle className="text-text-primary m-0 pr-10">{t('invoiceModal.title')}</ModalTitle>
          <ModalDescription className="sr-only">{t('invoiceModal.description')}</ModalDescription>
        </ModalHeader>

        <ModalBody className="flex flex-1 flex-col gap-6 p-4 max-sm:overflow-visible sm:overflow-y-auto sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="border-border-default flex flex-col gap-4 rounded-2xl border p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-text-secondary text-sm">{t('invoiceModal.createdAt')}</span>
                  <div>{formatDate(item.createdAt)}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-text-secondary text-sm">{t('invoiceModal.status')}</span>
                  <StatusBadge status={item.status} withBg />
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="bg-status-info-background text-icon-brand flex size-10 shrink-0 items-center justify-center rounded-[10px] text-sm font-medium">
                    {initials(item.studentName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs-base text-text-secondary">{t('invoiceModal.student')}</p>
                    <p className="text-s-base text-text-primary font-medium">{item.studentName}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-border-default flex flex-col gap-4 rounded-2xl border p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-text-secondary text-sm">
                    {t('invoiceModal.paymentType')}
                  </span>
                  <span className="text-m-base text-text-primary">{paymentTypeLabel}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-text-secondary text-sm">{t('invoiceModal.amount')}</span>
                  <span className="text-text-link text-h6 font-medium">
                    {formatMoney(item.total, locale)}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-text-secondary text-sm">{t('invoiceModal.comment')}</span>
                  <p className="text-text-primary text-sm whitespace-pre-wrap">
                    {item.comment || t('invoiceModal.commentEmpty')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section className="border-border-default flex flex-col gap-4 rounded-2xl border p-4">
            <h3 className="text-m-base text-text-primary font-medium">
              {t('invoiceModal.detailsTitle')}
            </h3>
            {item.items.length === 0 ? (
              <p className="text-text-secondary text-sm">{t('invoiceModal.detailsEmpty')}</p>
            ) : (
              <div className="hidden overflow-x-auto md:block">
                <div className="min-w-[560px]">
                  <div className="text-text-secondary grid grid-cols-[minmax(200px,1fr)_100px_100px_120px] gap-4 border-b pb-3 text-sm">
                    <p>{t('invoiceModal.item')}</p>
                    <p>{t('invoiceModal.price')}</p>
                    <p>{t('invoiceModal.quantity')}</p>
                    <p>{t('invoiceModal.sum')}</p>
                  </div>
                  <div className="divide-y">
                    {item.items.map((row, index) => (
                      <div
                        key={`${row.name}-${index}`}
                        className="text-text-primary grid grid-cols-[minmax(200px,1fr)_100px_100px_120px] gap-4 py-3 text-sm"
                      >
                        <p className="break-words">{row.name}</p>
                        <p>{row.price} ₽</p>
                        <p>{row.quantity}</p>
                        <p>{Number(row.price) * row.quantity} ₽</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {item.items.length > 0 && (
              <div className="flex flex-col gap-3 md:hidden">
                {item.items.map((row, index) => (
                  <div
                    key={`${row.name}-${index}`}
                    className="border-border-default bg-background-surface flex flex-col gap-2 rounded-2xl border p-3"
                  >
                    <p className="text-m-base text-text-primary">{row.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-text-secondary">{t('invoiceModal.price')}</p>
                        <p className="text-text-primary">{row.price} ₽</p>
                      </div>
                      <div>
                        <p className="text-text-secondary">{t('invoiceModal.quantity')}</p>
                        <p className="text-text-primary">{row.quantity}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-text-secondary">{t('invoiceModal.sum')}</p>
                        <p className="text-text-primary">{Number(row.price) * row.quantity} ₽</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </ModalBody>

        <ModalFooter className="flex w-full justify-end gap-4 border-0 p-4 sm:p-6">
          <Button className="w-31.75" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('invoiceModal.close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
