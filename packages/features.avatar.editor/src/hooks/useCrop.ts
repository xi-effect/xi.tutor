/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

export type CropArea = {
  width: number;
  height: number;
};

export type CropPosition = {
  x: number;
  y: number;
};

export const useCrop = () => {
  const [crop, setCrop] = useState<CropPosition>({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);

  const onCropChange = (newCrop: CropPosition) => {
    setCrop(newCrop);
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  return {
    crop,
    croppedAreaPixels,
    onCropChange,
    onCropComplete,
  };
};
