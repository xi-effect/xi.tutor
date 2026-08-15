import { StatusBadge } from 'features.invoice.card';
import { formatMoney } from 'features.charts';
import { getDateLocale } from 'common.ui';
import { ArrowRight } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import type { AnalyticsAttentionItemT } from './types';

type AnalyticsAttentionProps = {
  items: AnalyticsAttentionItemT[];
  onOpenInvoice: (item: AnalyticsAttentionItemT) => void;
};

const formatCreatedAt = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export const AnalyticsAttention = ({ items, onOpenInvoice }: AnalyticsAttentionProps) => {
  const { t } = useTranslation('payments');
  const locale = getDateLocale();

  return (
    <section className="bg-background-surface flex flex-col gap-4 rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-1">
        <h2 className="text-l-base text-text-primary font-medium">
          {t('analytics.attention.title')}
        </h2>
        <p className="text-s-base text-text-secondary">{t('analytics.attention.description')}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-s-base text-text-secondary">{t('analytics.attention.empty')}</p>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {items.map((item) => (
            <li key={item.recipientInvoiceId}>
              <button
                type="button"
                onClick={() => onOpenInvoice(item)}
                className="hover:bg-background-page flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors"
              >
                <div className="bg-status-info-background text-icon-brand flex size-10 shrink-0 items-center justify-center rounded-[10px] text-sm font-medium">
                  {initials(item.studentName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-s-base text-text-primary truncate font-medium">
                    {item.studentName}
                  </p>
                  <p className="text-xs-base text-text-secondary">
                    {formatCreatedAt(item.createdAt, locale)}
                  </p>
                </div>
                <StatusBadge status={item.status} withBg className="hidden sm:flex" />
                <p className="text-s-base text-text-primary w-[88px] shrink-0 text-right font-medium tabular-nums">
                  {formatMoney(item.total, locale)}
                </p>
                <ArrowRight className="fill-icon-secondary size-4 shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
