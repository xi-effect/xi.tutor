import { Button } from '@xipkg/button';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import type { CustomNotificationModalPayload } from 'common.services';
import {
  ModalCloseIcon,
  modalBodyClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalFooterClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';
import { cn } from '@xipkg/utils';
import type { NotificationLinkNavigateT } from './notificationsNavigation';

export const CustomNotificationModal = ({
  payload,
  onClose,
  onNavigate,
}: {
  payload: CustomNotificationModalPayload | null;
  onClose: () => void;
  onNavigate: NotificationLinkNavigateT;
}) => {
  return (
    <Modal open={!!payload} onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        className={cn(modalContentClass, 'flex max-h-[90vh] flex-col')}
        aria-describedby={undefined}
      >
        <div className={modalBodyClass}>
          <div className={modalHeaderRowClass}>
            <ModalTitle className={modalTitleClass}>{payload?.header}</ModalTitle>
            <ModalCloseIcon onClick={onClose} />
          </div>

          <div className="text-m-base text-text-secondary max-h-[50vh] overflow-y-auto">
            {payload?.content}
          </div>

          {payload?.button_text && payload?.button_link ? (
            <div className={modalFooterClass}>
              <Button
                variant="primary"
                size="m"
                className={modalConfirmButtonClass}
                onClick={() => {
                  const link = payload?.button_link;
                  if (link) {
                    onNavigate(link);
                    onClose();
                  }
                }}
              >
                {payload.button_text}
              </Button>
            </div>
          ) : null}
        </div>
      </ModalContent>
    </Modal>
  );
};
