import { Button } from '@xipkg/button';
import { Modal, ModalBody, ModalContent, ModalDescription, ModalTitle } from '@xipkg/modal';
import { getTariff, useSubscriptionPlan, useSubscriptionUiStore } from 'common.subscription';
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

export const SubscriptionDialogs = () => {
  const { t } = useTranslation('subscription');
  const dialog = useSubscriptionUiStore((s) => s.dialog);
  const closeDialog = useSubscriptionUiStore((s) => s.closeDialog);
  const openCompare = useSubscriptionUiStore((s) => s.openCompare);
  const { planId } = useSubscriptionPlan();
  const tariff = getTariff(planId);

  const copy =
    dialog === 'classroom'
      ? {
          title: t('limits.classroomTitle'),
          text: t('limits.classroomText', {
            plan: t(`plans.${planId}`),
            count: tariff.maxActiveClassrooms,
          }),
        }
      : dialog === 'storage'
        ? {
            title: t('limits.storageTitle'),
            text: t('limits.storageText', { plan: t(`plans.${planId}`) }),
          }
        : dialog === 'proFeature'
          ? {
              title: t('pro.title'),
              text: '',
            }
          : null;

  return (
    <Modal open={Boolean(dialog)} onOpenChange={(open) => !open && closeDialog()}>
      <ModalContent className={modalContentClass}>
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
              {dialog === 'proFeature' ? t('pro.close') : t('limits.close')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="m"
              className={modalConfirmButtonClass}
              onClick={() => openCompare(true)}
            >
              {dialog === 'proFeature' ? t('pro.viewPro') : t('limits.viewPro')}
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
