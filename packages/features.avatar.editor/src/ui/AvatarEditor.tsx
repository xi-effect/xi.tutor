/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import { Close, Minus, Plus } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { Slider } from '@xipkg/slider';
import Cropper from 'react-easy-crop';
import { useCrop, useZoom, useImageProcessing } from '../hooks';

type AvatarEditorT = {
  file: any;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  setDate?: (value: Date) => void;
  withLoadingToServer?: boolean;
  onBase64Return?: (resizedImageBase: string, form: FormData) => void;
  communityId?: number | undefined;
};

export const AvatarEditor = ({
  withLoadingToServer = true,
  file,
  open,
  onOpenChange,
  setDate,
  onBase64Return,
  communityId,
}: AvatarEditorT) => {
  const { crop, croppedAreaPixels, onCropChange, onCropComplete } = useCrop();
  const { zoom, onZoomChange, increaseZoom, decreaseZoom, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } =
    useZoom();
  const { processCroppedImage } = useImageProcessing({
    withLoadingToServer,
    onOpenChange,
    setDate,
    onBase64Return,
    communityId,
  });

  const showCroppedImage = async () => {
    await processCroppedImage(file, croppedAreaPixels);
  };

  return (
    <Modal open={open} onOpenChange={(value) => onOpenChange(value)}>
      <ModalContent className="z-50 sm:max-w-[600px]">
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0" />
        </ModalCloseButton>
        <div className="rounded-4 max-h-[calc(100dvh-16px)] overflow-auto">
          <ModalHeader className="mb-6">
            <ModalTitle className="xs:max-w-none max-w-[240px] leading-8">
              Изменение фотографии
            </ModalTitle>
          </ModalHeader>
          <div className="relative mx-auto h-[300px] w-[calc(100%-48px)]">
            <Cropper
              image={
                file ||
                'https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000'
              }
              crop={crop}
              cropSize={{ width: 236, height: 236 }}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={onCropChange}
              onCropComplete={onCropComplete}
              onZoomChange={onZoomChange}
              style={{
                containerStyle: {
                  borderRadius: '8px',
                  width: '100%',
                  height: '300px',
                },
                mediaStyle: {
                  transform: 'none',
                },
              }}
              minZoom={MIN_ZOOM}
            />
          </div>
          <div className="flex h-[60px] w-full items-center justify-center gap-2 px-6 pt-4 pb-6">
            <Button
              aria-label="Минус"
              type="button"
              variant="ghost"
              className="m-0 h-8 w-8 bg-transparent p-1"
              onClick={decreaseZoom}
            >
              <Minus />
            </Button>
            <Slider
              className="max-w-[250px] flex-1"
              value={[zoom]}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              min={MIN_ZOOM}
              defaultValue={[zoom]}
              onValueChange={(v: number[]) => onZoomChange(v[0])}
            />
            <Button
              aria-label="Плюс"
              type="button"
              variant="ghost"
              className="m-0 h-8 w-8 bg-transparent p-1"
              onClick={increaseZoom}
            >
              <Plus />
            </Button>
          </div>
          <ModalFooter className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Button onClick={() => showCroppedImage()} className="w-full sm:w-[126px]">
              Сохранить
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-[126px]"
              variant="secondary"
            >
              Отменить
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  );
};
