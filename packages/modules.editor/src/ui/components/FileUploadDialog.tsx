import { useState } from 'react';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { FileUploader } from '@xipkg/fileuploader';
import { useInterfaceStore } from '../../store/interfaceStore';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { optimizeImage } from '../../utils/optimizeImage';
import { useUploadImage } from 'common.services';
import { useBlockMenuActions, useYjsContext } from '../../hooks';
import { toast } from 'sonner';

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
      const uploadedId = await uploadImage({
        file: optimizedImage,
        token: storageItem.storage_token,
      });

      insertImage(uploadedId);
      closeModal();
    } catch (err) {
      console.error('Ошибка при загрузке изображения:', err);
    }
  };

  const handleAddLink = async () => {
    const trimmedLink = imageLink.trim();

    if (!trimmedLink) return;

    const isValidImage = await checkImageUrl(trimmedLink);

    if (!isValidImage) {
      toast.error('Некорректная ссылка на изображение');
      return;
    }

    insertImage(trimmedLink);

    closeModal();
  };

  return (
    <Modal open={activeModal === 'uploadImage'} onOpenChange={closeModal}>
      <ModalContent aria-describedby={undefined} className="max-w-md rounded-3xl p-4">
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
            <FileUploader onChange={handleInput} accept="image/*" size="large" />
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

function checkImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();

    img.onload = () => {
      resolve(true);
    };

    img.onerror = () => {
      resolve(false);
    };

    img.src = url;
  });
}
