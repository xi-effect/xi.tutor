import { useState } from 'react';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { toast } from 'sonner';
import { useInterfaceStore } from '../../store/interfaceStore';
import { useBlockMenuActions, useYjsContext } from '../../hooks';
import { checkImageUrl } from '../../utils/checkImageUrl';

export const ImageLinkModal = () => {
  const { t } = useTranslation('editor');
  const { closeModal, activeModal } = useInterfaceStore();
  const [imageLink, setImageLink] = useState('');
  const { editor } = useYjsContext();
  const { insertImage } = useBlockMenuActions(editor);

  const isOpen = activeModal === 'insertImageLink';

  const handleAddLink = async () => {
    const trimmedLink = imageLink.trim();
    if (!trimmedLink) return;

    const isValidImage = await checkImageUrl(trimmedLink);
    if (!isValidImage) {
      toast.error(t('upload.invalidLink'));
      return;
    }

    insertImage(trimmedLink);
    setImageLink('');
    closeModal();
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setImageLink('');
          closeModal();
        }
      }}
    >
      <ModalContent aria-describedby={undefined} className="max-w-md rounded-3xl p-4">
        <ModalTitle className="text-text-primary text-lg font-medium">
          {t('upload.insertLink')}
        </ModalTitle>
        <div className="mt-4 flex gap-2">
          <div className="w-full">
            <Input
              variant="s"
              placeholder={t('upload.linkPlaceholder')}
              className="border"
              name="fileLink"
              value={imageLink}
              onChange={(e) => setImageLink(e.target.value)}
            />
          </div>
          <Button size="s" onClick={() => void handleAddLink()}>
            {t('upload.add')}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};
