import { cn } from '@xipkg/utils';
import { Link } from '@xipkg/link';
import { formatBytes, formatRub, TARIFFS, useSubscriptionPlan } from 'common.subscription';
import { getAppLanguage } from 'common.ui';
import { useTranslation } from 'react-i18next';

export const SOVLIUM_PRICES_URL = 'https://sovlium.ru/prices';

export const TariffsCompareTable = () => {
  const { t } = useTranslation('subscription');
  const locale = getAppLanguage() === 'en' ? 'en-US' : 'ru-RU';
  const { planId } = useSubscriptionPlan();
  const basic = TARIFFS.basic;
  const pro = TARIFFS.pro;

  const rows = [
    {
      label: t('compare.price'),
      basic: t('price.free'),
      pro: t('price.perMonth', { price: formatRub(pro.priceMonthlyRub, locale) }),
    },
    {
      label: t('compare.classrooms'),
      basic: String(basic.maxActiveClassrooms),
      pro: String(pro.maxActiveClassrooms),
    },
    {
      label: t('compare.storage'),
      basic: formatBytes(basic.storageBytes, locale),
      pro: formatBytes(pro.storageBytes, locale),
    },
    {
      label: t('compare.images'),
      basic: formatBytes(basic.maxImageBytes, locale),
      pro: formatBytes(pro.maxImageBytes, locale),
    },
    {
      label: t('compare.files'),
      basic: formatBytes(basic.maxFileBytes, locale),
      pro: formatBytes(pro.maxFileBytes, locale),
    },
    {
      label: t('compare.calls'),
      basic: t('compare.callsHours', { count: basic.maxVideoCallHoursPerMonth }),
      pro: t('compare.unlimited'),
    },
    {
      label: t('compare.extra'),
      basic: t('compare.notIncluded'),
      pro: t('compare.included'),
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-text-primary text-sm font-medium">{t('compare.title')}</span>
        <Link
          href={SOVLIUM_PRICES_URL}
          target="_blank"
          rel="noreferrer"
          size="s"
          className="text-text-link shrink-0"
          data-umami-event="outbound-link-click"
          data-umami-event-url={SOVLIUM_PRICES_URL}
          data-umami-event-type="prices"
        >
          {t('overview.landing')}
        </Link>
      </div>
      <div className="border-border-strong overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-md border-collapse text-sm">
          <thead>
            <tr className="bg-background-subtle">
              <th className="text-text-secondary w-[36%] px-3 py-3 text-left font-medium" />
              <PlanHead
                name={t('plans.basic')}
                current={planId === 'basic'}
                currentLabel={t('compare.current')}
              />
              <PlanHead
                name={t('plans.pro')}
                current={planId === 'pro'}
                currentLabel={t('compare.current')}
              />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-border-default border-t">
                <td className="text-text-secondary px-3 py-3">{row.label}</td>
                <td
                  className={cn(
                    'text-text-primary px-3 py-3',
                    planId === 'basic' && 'bg-status-info-background/40',
                  )}
                >
                  {row.basic}
                </td>
                <td
                  className={cn(
                    'text-text-primary px-3 py-3 font-medium',
                    planId === 'pro' && 'bg-status-info-background/40',
                  )}
                >
                  {row.pro}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const PlanHead = ({
  name,
  current,
  currentLabel,
}: {
  name: string;
  current: boolean;
  currentLabel: string;
}) => (
  <th
    className={cn(
      'text-text-primary px-3 py-3 text-left font-semibold',
      current && 'bg-status-info-background/40',
    )}
  >
    {name}
    {current ? (
      <span className="text-text-secondary mt-1 block text-xs font-normal">{currentLabel}</span>
    ) : null}
  </th>
);
