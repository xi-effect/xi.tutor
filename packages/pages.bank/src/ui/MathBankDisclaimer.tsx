import { InfoCircle } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

export const MATH_BANK_TERMS_URL = 'https://sovlium.ru/legal/terms#prava-na-servis';

type MathBankDisclaimerProps = {
  className?: string;
};

export const MathBankDisclaimer = ({ className }: MathBankDisclaimerProps) => {
  const { t } = useTranslation('mathBank');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'hover:bg-background-page inline-flex size-6 shrink-0 items-center justify-center rounded-full p-0',
            className,
          )}
          aria-label={t('disclaimer.aria')}
        >
          <InfoCircle size="s" className="fill-icon-secondary size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        collisionPadding={12}
        className="bg-background-surface border-border-default z-80 w-[min(320px,calc(100vw-32px))] rounded-2xl border p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] outline-none"
      >
        <p className="text-s-base text-text-secondary leading-5">{t('disclaimer.text')}</p>
        <a
          href={MATH_BANK_TERMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-s-base text-text-link mt-2 inline-block font-medium"
        >
          {t('disclaimer.more')}
        </a>
      </PopoverContent>
    </Popover>
  );
};
