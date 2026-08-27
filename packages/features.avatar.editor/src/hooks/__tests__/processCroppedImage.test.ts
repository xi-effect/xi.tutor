import { describe, expect, it, vi } from 'vitest';
import { runProcessCroppedImage } from '../processCroppedImage';
import type { CropArea } from '../useCrop';

const crop: CropArea = { x: 10, y: 20, width: 236, height: 236 };

const createDeps = () => {
  const croppedBlob = new Blob(['cropped'], { type: 'image/png' });
  const resizedBlob = new Blob(['resized'], { type: 'image/png' });

  return {
    croppedBlob,
    resizedBlob,
    file: 'data:image/png;base64,abc',
    croppedAreaPixels: crop,
    onOpenChange: vi.fn(),
    setDate: vi.fn(),
    onBase64Return: vi.fn(),
    getCroppedImg: vi.fn().mockResolvedValue(croppedBlob),
    resizeFile: vi.fn().mockResolvedValue(resizedBlob),
    blobToDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,resized'),
    uploadAvatar: vi.fn().mockResolvedValue({ status: 204 }),
    onSuccess: vi.fn(),
    onError: vi.fn(),
  };
};

describe('runProcessCroppedImage', () => {
  it('ничего не делает без области кропа', async () => {
    const deps = createDeps();

    const result = await runProcessCroppedImage({
      ...deps,
      croppedAreaPixels: null,
    });

    expect(result).toBeNull();
    expect(deps.getCroppedImg).not.toHaveBeenCalled();
    expect(deps.resizeFile).not.toHaveBeenCalled();
    expect(deps.uploadAvatar).not.toHaveBeenCalled();
    expect(deps.onError).not.toHaveBeenCalled();
  });

  it('ресайзит кроп и загружает аватар на сервер', async () => {
    const deps = createDeps();

    await runProcessCroppedImage(deps);

    expect(deps.getCroppedImg).toHaveBeenCalledWith(deps.file, crop);
    expect(deps.resizeFile).toHaveBeenCalledTimes(1);

    const resizedFile = deps.resizeFile.mock.calls[0][0] as File;
    expect(resizedFile).toBeInstanceOf(File);
    expect(resizedFile.name).toBe('avatar.png');
    expect(resizedFile.type).toBe('image/png');

    expect(deps.uploadAvatar).toHaveBeenCalledTimes(1);
    const form = deps.uploadAvatar.mock.calls[0][0] as FormData;
    const avatar = form.get('avatar');
    expect(avatar).toBeInstanceOf(Blob);

    expect(deps.onSuccess).toHaveBeenCalledTimes(1);
    expect(deps.onOpenChange).toHaveBeenCalledWith(false);
    expect(deps.setDate).toHaveBeenCalledWith(expect.any(Date));
    expect(deps.blobToDataUrl).not.toHaveBeenCalled();
    expect(deps.onBase64Return).not.toHaveBeenCalled();
  });

  it('при локальном режиме возвращает base64 и form без загрузки', async () => {
    const deps = createDeps();

    await runProcessCroppedImage({
      ...deps,
      withLoadingToServer: false,
    });

    expect(deps.uploadAvatar).not.toHaveBeenCalled();
    expect(deps.blobToDataUrl).toHaveBeenCalledWith(deps.resizedBlob);
    expect(deps.onBase64Return).toHaveBeenCalledWith(
      'data:image/png;base64,resized',
      expect.any(FormData),
    );
    expect(deps.onSuccess).not.toHaveBeenCalled();
    expect(deps.onOpenChange).not.toHaveBeenCalled();
  });

  it('не считает успехом ответ кроме 204', async () => {
    const deps = createDeps();
    deps.uploadAvatar.mockResolvedValue({ status: 200 });

    await runProcessCroppedImage(deps);

    expect(deps.onSuccess).not.toHaveBeenCalled();
    expect(deps.onOpenChange).not.toHaveBeenCalled();
    expect(deps.setDate).not.toHaveBeenCalled();
    expect(deps.onError).not.toHaveBeenCalled();
  });

  it('вызывает onError, если resizer падает', async () => {
    const deps = createDeps();
    const error = new TypeError('imageFileResizer is not a function');
    deps.resizeFile.mockRejectedValue(error);

    const result = await runProcessCroppedImage(deps);

    expect(result).toBeNull();
    expect(deps.uploadAvatar).not.toHaveBeenCalled();
    expect(deps.onSuccess).not.toHaveBeenCalled();
    expect(deps.onError).toHaveBeenCalledWith(error);
  });

  it('вызывает onError, если кроп не дал изображение', async () => {
    const deps = createDeps();
    deps.getCroppedImg.mockResolvedValue(null);

    await runProcessCroppedImage(deps);

    expect(deps.resizeFile).not.toHaveBeenCalled();
    expect(deps.uploadAvatar).not.toHaveBeenCalled();
    expect(deps.onError).toHaveBeenCalledWith(expect.any(Error));
  });
});
