import { useState } from 'react';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { FileUploader } from '@xipkg/fileuploader';
import { useInterfaceStore } from '../../store/interfaceStore';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { optimizeImage } from '../../utils/optimizeImage';

export const ImageUploadModal = () => {
  const { closeModal, activeModal } = useInterfaceStore();
  const [mode, setMode] = useState<'upload' | 'link'>('upload');

  const handleInput = async (files: File[]) => {
    if (!files) return;
    const file = files[0];
    const processed = await optimizeImage(file);
    console.log(processed);
  };

  const handleAddLink = () => {
    console.log('Добавлена ссылка');
  };

  return (
    <Modal open={activeModal === 'uploadImage'} onOpenChange={closeModal}>
      <ModalContent className="max-w-md rounded-3xl p-4">
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
