import { useState } from 'react';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { FileUploader } from '@xipkg/fileuploader';
import { useInterfaceStore } from '../../store/interfaceStore';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { optimizeImage } from '../../utils/optimizeImage';
import { useUploadImage } from 'common.services';
import { useBlockMenuActions, useYjsContext } from '../../hooks';

export const ImageUploadModal = () => {
  const { closeModal, activeModal } = useInterfaceStore();
  const [mode, setMode] = useState<'upload' | 'link'>('upload');
  const [imageLink, setImageLink] = useState('');

  const { editor, storageItem } = useYjsContext();

  const { mutateAsync: uploadImage } = useUploadImage();

  const { insertImage } = useBlockMenuActions(editor);

  const handleInput = async (files: File[]) => {
    if (!files) return;
    const file = files[0];
    const optimizedImage = await optimizeImage(file);
    try {
      const uploadedUrl = await uploadImage({
        file: optimizedImage,
        token: storageItem.storage_token,
      });

      insertImage(uploadedUrl);

      closeModal();
    } catch (err) {
      console.error('Ошибка при загрузке изображения:', err);
    }
  };

  const handleAddLink = () => {
    if (!imageLink.trim()) return;
    insertImage(imageLink.trim());
    closeModal();
  };

  return (
    <Modal open={activeModal === 'uploadImage'} onOpenChange={closeModal}>
      <ModalContent
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="max-w-md rounded-3xl p-4"
      >
        <ModalTitle className="flex gap-1">
          <Button
            variant={mode === 'upload' ? 'default' : 'ghost'}
            className="h-[26px] px-3 text-[14px]"
            onClick={() => setMode('upload')}
          >
            Загрузить
          </Button>

          <Button
            variant={mode === 'link' ? 'default' : 'ghost'}
            className="h-[26px] px-3 text-[14px]"
            onClick={() => setMode('link')}
          >
            Вставить ссылку
          </Button>
        </ModalTitle>

        <div className="mt-4">
          {mode === 'upload' ? (
            <FileUploader
              onChange={handleInput}
              accept="image/*"
              withError={false}
              withLargeError={false}
              size="large"
            />
          ) : (
            <div className="flex gap-2">
              <div className="w-full">
                <Input
                  variant="s"
                  placeholder="Вставьте ссылку на изображение"
                  className="border"
                  name="fileLink"
                  value={imageLink}
                  onChange={(e) => setImageLink(e.target.value)}
                />
              </div>
              <Button size="s" onClick={handleAddLink}>
                Добавить
              </Button>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};
