import { Button } from '@xipkg/button';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import type { CustomNotificationModalPayload } from 'common.services';
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
      <ModalContent className="flex max-h-[90vh] max-w-[480px] flex-col">
        <ModalHeader>
          <ModalTitle className="text-m-lg font-semibold text-gray-100">
            {payload?.header}
          </ModalTitle>
          <ModalCloseButton />
        </ModalHeader>

        <ModalBody className="text-s-base text-gray-80 flex-1 overflow-y-auto">
          {payload?.content}
        </ModalBody>

        {payload?.button_text && payload?.button_link && (
          <ModalFooter>
            <Button
              size="m"
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
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};
