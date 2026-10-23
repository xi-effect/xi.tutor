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

type DialogId = Exclude<SubscriptionDialog, null>;

type DialogCopy = {
  title: string;
  text: string;
  closeLabel: string;
  confirmLabel: string;
};

const imageSize = (plan: PlanId) => formatMegabytes(getTariff(plan).maxImageBytes);

export const SubscriptionDialogs = () => {
  const { t } = useTranslation('subscription');
  const dialog = useSubscriptionUiStore((s) => s.dialog);
  const closeDialog = useSubscriptionUiStore((s) => s.closeDialog);
  const openCompare = useSubscriptionUiStore((s) => s.openCompare);
  const { planId, tariff, isPro } = useSubscriptionPlan();
  const limits = tariff ?? (planId ? getTariff(planId) : null);
  const planName = planId ? t(`plans.${planId}`) : '';
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
                onClick={() => openCompare(true)}
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
