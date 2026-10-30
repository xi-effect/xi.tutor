import { useEffect, useRef } from 'react';
import { Button } from '@xipkg/button';
import { Modal, ModalBody, ModalContent, ModalDescription, ModalTitle } from '@xipkg/modal';
import { cn } from '@xipkg/utils';
import {
  formatMegabytes,
  getTariff,
  useSubscriptionPlan,
  useSubscriptionUiStore,
  type PlanId,
  type SubscriptionDialog,
} from 'common.subscription';
import {
  ModalCloseIcon,
  modalBodyClass,
  modalCancelButtonClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalDescriptionClass,
  modalFooterClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';
import { useTranslation } from 'react-i18next';
import {
  subscriptionSourceForPaywall,
  trackSubscriptionPaywallShown,
  trackSubscriptionPaywallUpgradeClicked,
  type SubscriptionPaywallLimitType,
} from 'common.utils';

type DialogId = Exclude<SubscriptionDialog, null>;

type DialogCopy = {
  title: string;
  text: string;
  closeLabel: string;
  confirmLabel: string;
};

const imageSize = (plan: PlanId) => formatMegabytes(getTariff(plan).maxImageBytes);

const limitTypeForDialog = (dialog: DialogId): SubscriptionPaywallLimitType => {
  if (dialog === 'classroom') return 'classrooms';
  if (dialog === 'storage') return 'storage';
  if (dialog === 'imageUpgrade') return 'file_size';
  return 'other';
};

export const SubscriptionDialogs = () => {
  const { t } = useTranslation('subscription');
  const dialog = useSubscriptionUiStore((s) => s.dialog);
  const closeDialog = useSubscriptionUiStore((s) => s.closeDialog);
  const openCompare = useSubscriptionUiStore((s) => s.openCompare);
  const { planId, tariff, isPro } = useSubscriptionPlan();
  const limits = tariff ?? (planId ? getTariff(planId) : null);
  const planName = planId ? t(`plans.${planId}`) : '';
  const seenDialog = useRef<DialogId | null>(null);

  useEffect(() => {
    if (!dialog) {
      seenDialog.current = null;
      return;
    }
    if (!planId || seenDialog.current === dialog) return;
    seenDialog.current = dialog;
    trackSubscriptionPaywallShown({
      limitType: limitTypeForDialog(dialog),
      currentPlan: planId,
    });
  }, [dialog, planId]);
  const limitActions = {
    closeLabel: t('limits.close'),
    confirmLabel: t('limits.viewPro'),
  };

  const dialogCopy: Record<DialogId, DialogCopy> = {
    classroom: {
      title: t('limits.classroomTitle'),
      text: t('limits.classroomText', {
        plan: planName,
        count: limits?.maxActiveClassrooms ?? 0,
      }),
      ...limitActions,
    },
    storage: {
      title: t('limits.storageTitle'),
      text: t('limits.storageText', { plan: planName }),
      ...limitActions,
    },
    proFeature: {
      title: t('pro.title'),
      text: '',
      closeLabel: t('pro.close'),
      confirmLabel: t('pro.viewPro'),
    },
    imageUpgrade: {
      title: t('limits.imageUpgradeTitle'),
      text: t('limits.imageUpgradeText', {
        basicSize: imageSize('basic'),
        proSize: imageSize('pro'),
      }),
      ...limitActions,
    },
  };

  const copy = dialog ? dialogCopy[dialog] : null;
  const offerPro = dialog !== 'storage' || !isPro;

  return (
    <Modal open={Boolean(dialog)} onOpenChange={(open) => !open && closeDialog()}>
      <ModalContent className={cn(modalContentClass)}>
        <ModalBody className={modalBodyClass}>
          <div className={modalHeaderRowClass}>
            <ModalTitle className={modalTitleClass}>{copy?.title}</ModalTitle>
            <ModalCloseIcon onClick={closeDialog} />
          </div>
          {copy?.text ? (
            <ModalDescription className={modalDescriptionClass}>{copy.text}</ModalDescription>
          ) : (
            <ModalDescription className="sr-only">{copy?.title}</ModalDescription>
          )}
          <div className={modalFooterClass}>
            <Button
              type="button"
              variant="none"
              size="m"
              className={modalCancelButtonClass}
              onClick={closeDialog}
            >
              {copy?.closeLabel}
            </Button>
            {offerPro ? (
              <Button
                type="button"
                variant="primary"
                size="m"
                className={modalConfirmButtonClass}
                onClick={() => {
                  if (!dialog) return;
                  const limitType = limitTypeForDialog(dialog);
                  trackSubscriptionPaywallUpgradeClicked({
                    limitType,
                    currentPlan: planId ?? undefined,
                  });
                  useSubscriptionUiStore
                    .getState()
                    .setAnalyticsSource(subscriptionSourceForPaywall(limitType));
                  openCompare(true);
                }}
              >
                {copy?.confirmLabel}
              </Button>
            ) : null}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
