import { useState } from 'react';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { FileUploader } from '@xipkg/fileuploader';
import { useTranslation } from 'react-i18next';
import { EditorModalT, useInterfaceStore } from '../../store/interfaceStore';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { optimizeImage } from '../../utils/optimizeImage';
import { isFileNameTooLong, MAX_FILENAME_LENGTH, useUploadImage } from 'common.services';
import { useBlockMenuActions, useYjsContext } from '../../hooks';
import { toast } from 'sonner';
import { checkImageUrl } from '../../utils/checkImageUrl';
import { AUDIO_ACCEPT, PDF_ACCEPT, PRESENTATION_ACCEPT } from '../../const/media';
import { insertAudioFile, insertPdfFile, insertPresentationFile } from '../../utils/insertMedia';

const MEDIA_MODALS: Exclude<EditorModalT, 'uploadImage' | null>[] = [
  'uploadAudio',
  'uploadPdf',
  'uploadPresentation',
];

export const ImageUploadModal = () => {
  const { t } = useTranslation('editor');
  const { closeModal, activeModal } = useInterfaceStore();
  const [mode, setMode] = useState<'upload' | 'link'>('upload');
  const [imageLink, setImageLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { editor, storageItem } = useYjsContext();
  const { mutateAsync: uploadImage } = useUploadImage();
  const { insertImage } = useBlockMenuActions(editor);

  const isImageModal = activeModal === 'uploadImage';
  const isMediaModal = MEDIA_MODALS.includes(activeModal as (typeof MEDIA_MODALS)[number]);

  const handleImageInput = async (files: File[]) => {
    if (!files?.length || !editor || isUploading) return;
    const file = files[0];

    if (isFileNameTooLong(file.name)) {
      toast.error(t('upload.fileNameTooLong'), {
        description: t('upload.fileNameTooLongDesc', { max: MAX_FILENAME_LENGTH }),
      });
      return;
    }

    try {
      setIsUploading(true);
      const optimizedImage = await optimizeImage(file);
      const uploadedId = await uploadImage({
        file: optimizedImage,
        token: storageItem.content_token,
      });
      insertImage(uploadedId);
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error(t('toast.imageUploadError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaInput = async (files: File[]) => {
    if (!files?.length || !editor || !activeModal || isUploading) return;
    const file = files[0];
    const token = storageItem.content_token;

    try {
      setIsUploading(true);
      if (activeModal === 'uploadAudio') {
        await insertAudioFile(editor, file, token);
      } else if (activeModal === 'uploadPdf') {
        await insertPdfFile(editor, file, token);
      } else if (activeModal === 'uploadPresentation') {
        await insertPresentationFile(editor, file, token);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error(t('toast.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileError = (titleError: string, subtitleError?: string) => {
    if (!titleError) return;
    toast.error(titleError, {
      ...(subtitleError && { description: subtitleError }),
    });
  };

  const handleAddLink = async () => {
    const trimmedLink = imageLink.trim();
    if (!trimmedLink) return;

    const isValidImage = await checkImageUrl(trimmedLink);
    if (!isValidImage) {
      toast.error(t('upload.invalidLink'));
      return;
    }

    insertImage(trimmedLink);
    closeModal();
  };

  const acceptByModal: Record<(typeof MEDIA_MODALS)[number], string> = {
    uploadAudio: AUDIO_ACCEPT,
    uploadPdf: PDF_ACCEPT,
    uploadPresentation: PRESENTATION_ACCEPT,
  };

  return (
    <Modal open={isImageModal || isMediaModal} onOpenChange={closeModal}>
      <ModalContent aria-describedby={undefined} className="max-w-md rounded-3xl p-4">
        {isImageModal ? (
          <>
            <ModalTitle className="flex gap-1">
              <Button
                variant={mode === 'upload' ? 'default' : 'ghost'}
                className="h-[26px] px-3 text-[14px]"
                onClick={() => setMode('upload')}
              >
                {t('upload.upload')}
              </Button>
              <Button
                variant={mode === 'link' ? 'default' : 'ghost'}
                className="h-[26px] px-3 text-[14px]"
                onClick={() => setMode('link')}
              >
                {t('upload.insertLink')}
              </Button>
            </ModalTitle>
            <div className="mt-4">
              {mode === 'upload' ? (
                <FileUploader
                  onChange={handleImageInput}
                  onFileError={handleFileError}
                  accept="image/*"
                  size="large"
                />
              ) : (
                <div className="flex gap-2">
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
                  <Button size="s" onClick={handleAddLink}>
                    {t('upload.add')}
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <ModalTitle>
              {activeModal === 'uploadAudio' && t('upload.audioTitle')}
              {activeModal === 'uploadPdf' && t('upload.pdfTitle')}
              {activeModal === 'uploadPresentation' && t('upload.presentationTitle')}
            </ModalTitle>
            <div className="mt-4">
              <FileUploader
                onChange={handleMediaInput}
                onFileError={handleFileError}
                accept={
                  activeModal === 'uploadAudio' ||
                  activeModal === 'uploadPdf' ||
                  activeModal === 'uploadPresentation'
                    ? acceptByModal[activeModal]
                    : AUDIO_ACCEPT
                }
                size="large"
              />
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
