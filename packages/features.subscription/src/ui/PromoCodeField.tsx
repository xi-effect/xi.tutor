import { useState, type FormEvent } from 'react';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { useCanUseSubscriptionCommerce } from 'common.subscription';
import { useRedeemPromocode } from 'common.services';
import { useTranslation } from 'react-i18next';

export const PromoCodeField = () => {
  const { t } = useTranslation('subscription');
  const { allowed } = useCanUseSubscriptionCommerce();
  const redeemPromocode = useRedeemPromocode();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const trimmed = code.trim();
  const pending = redeemPromocode.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!allowed || !trimmed || pending) return;

    setStatus(null);

    try {
      await redeemPromocode.mutateAsync(trimmed);
      setCode('');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (!allowed) return null;

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-text-primary text-base font-semibold">{t('promo.title')}</h3>
      <p className="text-text-secondary text-sm leading-5">{t('promo.hint')}</p>
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div className="w-full min-w-0 flex-1">
          <Input
            variant="m"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setStatus(null);
            }}
            placeholder={t('promo.placeholder')}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            disabled={pending}
            error={status === 'error'}
            aria-invalid={status === 'error'}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="m"
          className="h-12 shrink-0 rounded-xl px-4 font-medium"
          disabled={trimmed.length === 0 || pending}
        >
          {t('promo.apply')}
        </Button>
      </form>
      {status === 'success' ? (
        <p className="text-status-success-text text-sm" role="status">
          {t('promo.success')}
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="text-status-error-text text-sm" role="alert">
          {t('promo.error')}
        </p>
      ) : null}
    </section>
  );
};
