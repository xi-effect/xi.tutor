import type { ReactNode } from 'react';
import { ArrowLeft } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';

type HeaderPropsT = {
  title: string;
  action?: ReactNode;
  onBack?: () => void;
};

export const Header = ({ title, action, onBack }: HeaderPropsT) => {
  const { t } = useTranslation('profile');

  return (
    <div className="flex shrink-0 items-center gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label={t('menu.back')}
          className="text-text-secondary hover:bg-background-subtle hover:text-text-primary flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors"
        >
          <ArrowLeft className="fill-icon-secondary size-6" />
        </button>
      ) : null}
      <h1 className="text-text-primary min-w-0 flex-1 truncate text-2xl leading-8 font-medium">
        {title}
      </h1>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
};
