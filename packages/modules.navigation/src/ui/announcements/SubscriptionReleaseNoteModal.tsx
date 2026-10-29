import { Button } from '@xipkg/button';
import { External } from '@xipkg/icons';
import { Modal, ModalBody, ModalContent, ModalTitle } from '@xipkg/modal';
import { useSubscriptionPlan } from 'common.subscription';
import { Trans, useTranslation } from 'react-i18next';
import {
  ModalCloseIcon,
  modalCancelButtonClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalFooterClass,
  modalHeaderRowClass,
} from 'common.ui';

const RELEASE_NOTE_ARTICLE_URL = 'https://sovlium.ru/blog/sovlium-zavershenie-testirovaniya-2026';

type SubscriptionReleaseNoteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismissForever: () => void;
  onActivatePromo: () => void;
  onArticleOpen: () => void;
};

export const SubscriptionReleaseNoteModal = ({
  open,
  onOpenChange,
  onDismissForever,
  onActivatePromo,
  onArticleOpen,
}: SubscriptionReleaseNoteModalProps) => {
  const { t } = useTranslation('navigation');
  const { t: tPlan } = useTranslation('subscription');
  const { planId, isPlanReady } = useSubscriptionPlan();
  const planName = isPlanReady && planId ? tPlan(`plans.${planId}`) : '';

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className={`${modalContentClass} max-w-[760px]`} aria-describedby={undefined}>
        <ModalBody className="flex min-w-0 flex-col gap-5 overflow-hidden p-5 sm:p-8">
          <div className={modalHeaderRowClass}>
            <ModalTitle className="font-playfair text-text-primary m-0 min-w-0 flex-1 text-xl leading-snug font-medium wrap-break-word sm:text-2xl sm:leading-normal">
              {planName
                ? t('releaseNote.title', { plan: planName })
                : t('releaseNote.titlePending')}
            </ModalTitle>
            <ModalCloseIcon onClick={() => onOpenChange(false)} aria-label={t('close')} />
          </div>

          <div className="flex min-w-0 items-center gap-4">
            <div className="text-m-base text-text-secondary sm:text-l-base flex min-w-0 flex-1 flex-col gap-3 leading-5 text-pretty wrap-break-word sm:leading-6">
              <p className="m-0">{t('releaseNote.intro')}</p>
              <p className="m-0">
                <Trans
                  i18nKey="releaseNote.lead"
                  ns="navigation"
                  values={{ plan: tPlan('plans.pro') }}
                  components={{ bold: <span className="text-text-primary font-bold" /> }}
                />
              </p>
              <p className="m-0">{t('releaseNote.leadNext')}</p>
            </div>
            <img
              src="/stickers/9.webp"
              alt=""
              className="pointer-events-none size-40 shrink-0 object-contain sm:size-56"
            />
          </div>

          <div
            className={`${modalFooterClass} w-full flex-col items-stretch sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end`}
          >
            <Button
              type="button"
              variant="ghost"
              size="m"
              className={`${modalCancelButtonClass} w-full justify-center sm:w-auto`}
              onClick={onDismissForever}
            >
              {t('releaseNote.dismiss')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="m"
              className={`${modalConfirmButtonClass} w-full justify-center sm:w-auto`}
              onClick={onActivatePromo}
            >
              {t('releaseNote.activate')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="m"
              className={`${modalConfirmButtonClass} w-full justify-center gap-2 sm:w-auto`}
              onClick={() => {
                onArticleOpen();
                window.open(RELEASE_NOTE_ARTICLE_URL, '_blank', 'noopener,noreferrer');
              }}
            >
              {t('releaseNote.read')}
              <External className="fill-text-on-accent size-4 shrink-0" />
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
