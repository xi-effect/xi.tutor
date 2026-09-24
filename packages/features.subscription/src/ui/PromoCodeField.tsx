import { useState } from 'react';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { cn } from '@xipkg/utils';
import { applyMockPromo, useSubscriptionStore, type PromoStatus } from 'common.subscription';
import { useTranslation } from 'react-i18next';

export const PromoCodeField = () => {
  const { t } = useTranslation('subscription');
  const applyPromoDays = useSubscriptionStore((state) => state.applyPromoDays);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<PromoStatus | null>(null);
  const [addedDays, setAddedDays] = useState(0);

  const tone =
    status === 'success' ? 'text-status-success-text' : status ? 'text-status-error-text' : '';

  const handleApply = () => {
    const result = applyMockPromo(code);
    setStatus(result.status);
    setAddedDays(result.addedDays);

    if (result.status === 'success') {
      applyPromoDays(result.addedDays);
      setCode('');
    }
  };

  return (
    <section className="border-border-strong flex flex-col gap-2 rounded-2xl border p-4">
      <span className="text-text-primary text-sm font-medium">{t('promo.title')}</span>
      <p className="text-text-secondary text-xs">{t('promo.hint')}</p>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            if (status) setStatus(null);
          }}
          placeholder={t('promo.placeholder')}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleApply();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="m"
          onClick={handleApply}
          disabled={!code.trim()}
        >
          {t('promo.apply')}
        </Button>
      </div>
      {status ? (
        <p className={cn('text-xs', tone)}>
          {status === 'success' ? t('promo.success', { count: addedDays }) : t(`promo.${status}`)}
        </p>
      ) : null}
    </section>
  );
};
