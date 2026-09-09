import { useState } from 'react';
import { Button } from '@xipkg/button';
import {
  isYookassaSavedCardUiEnabled,
  useSavedPaymentMethod,
  type YookassaSavedCardUiUser,
} from 'common.subscription';
import { ConfirmDialog } from 'common.ui';
import { useTranslation } from 'react-i18next';

export const PaymentMethodSettings = ({ user }: { user?: YookassaSavedCardUiUser }) => {
  const { t } = useTranslation('subscription');
  const { method, unlink } = useSavedPaymentMethod(user?.id);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isYookassaSavedCardUiEnabled(user) || !user) return null;

  return (
    <section className="border-border-strong flex flex-col gap-4 rounded-2xl border p-4">
      <h2 className="text-text-primary text-sm font-medium">{t('paymentMethod.title')}</h2>

      {method ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              {method.paymentSystem ? (
                <span className="text-text-secondary text-sm">{method.paymentSystem}</span>
              ) : null}
              <span className="text-text-primary text-sm font-medium">
                {t('paymentMethod.cardNumber', { last4: method.last4 })}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="m"
            className="text-text-danger h-12 w-full rounded-xl"
            onClick={() => setConfirmOpen(true)}
          >
            {t('paymentMethod.unlink')}
          </Button>
        </div>
      ) : (
        <p className="text-text-secondary text-sm">{t('paymentMethod.unlinked')}</p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('paymentMethod.unlinkTitle')}
        description={t('paymentMethod.unlinkDescription')}
        confirmLabel={t('paymentMethod.unlinkConfirm')}
        cancelLabel={t('paymentMethod.cancel')}
        onConfirm={unlink}
      />
    </section>
  );
};
