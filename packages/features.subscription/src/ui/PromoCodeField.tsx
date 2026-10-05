import { useState, type FormEvent } from 'react';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { useTranslation } from 'react-i18next';

export const PromoCodeField = () => {
  const { t } = useTranslation('subscription');
  const [code, setCode] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-text-primary text-base font-semibold">{t('promo.title')}</h3>
      <p className="text-text-secondary text-sm leading-5">{t('promo.hint')}</p>
      <form className="flex flex-col gap-2 sm:flex-row sm:items-center" onSubmit={handleSubmit}>
        <div className="w-full min-w-0 flex-1">
          <Input
            variant="m"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={t('promo.placeholder')}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="m"
          className="h-12 shrink-0 rounded-xl px-4 font-medium"
          disabled={code.trim().length === 0}
        >
          {t('promo.apply')}
        </Button>
      </form>
    </section>
  );
};
