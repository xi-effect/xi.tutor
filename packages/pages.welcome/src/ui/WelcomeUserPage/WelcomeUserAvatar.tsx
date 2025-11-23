import React from 'react';
import { FileUploader } from '@xipkg/fileuploader';
import { toast } from 'sonner';
import { AvatarEditor } from 'features.avatar.editor';
import { AvatarPreview } from './AvatarPreview';
import { readFile } from '../../utils';
import { useWelcomeContext } from '../../hooks';

export const WelcomeUserAvatar = () => {
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = React.useState(false);
  const [file, setFile] = React.useState<string | ArrayBuffer | null>();
  const [avatarTimestamp, setAvatarTimestamp] = React.useState<number>(Date.now());

  const handleError = (error: string) => {
    if (error === 'Поддерживаются только файлы PNG и JPEG') {
      toast.error('Этот формат не поддерживается', {
        description: 'Загрузите фото в (png, jpeg)',
        position: 'top-right',
        richColors: true,
      });
    } else if (error === 'Файл слишком большой') {
      toast.error('Фото слишком большое', {
        description: 'Выберите фото до 1 Мб',
        position: 'top-right',
        richColors: true,
      });
    } else {
      toast.error(error, {
        position: 'top-right',
        richColors: true,
      });
    }

    return;
  };

  const validateBeforeUpload = (files: File[]): string | undefined => {
    const file = files[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return 'Поддерживаются только файлы PNG и JPEG';
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'Файл слишком большой';
    }

    return undefined;
  };

  const handleInput = async (files: File[]) => {
    if (!files) return;

    const imageDataUrl = await readFile(files[0]);

    setFile(imageDataUrl);
    setIsAvatarEditorOpen(true);
  };

  const { id } = useWelcomeContext();
  const date = React.useRef<'' | Date>('');

  const setDate = (value: Date) => {
    date.current = value;
    // Обновляем timestamp для принудительного обновления аватара
    setAvatarTimestamp(Date.now());
  };

  return (
    <div className="mt-8 flex h-16 flex-row">
      <AvatarPreview userId={id} timestamp={avatarTimestamp} />
      <div className="ml-4 flex flex-col gap-2">
        <p className="text-gray-90 w-full leading-[22px] font-medium">
          Аватар&nbsp;
          <span className="text-gray-40 font-normal">(необязательно)</span>
        </p>
        <AvatarEditor
          file={file}
          open={isAvatarEditorOpen}
          onOpenChange={setIsAvatarEditorOpen}
          setDate={setDate}
        />
        <FileUploader
          onChange={handleInput}
          // @ts-expect-error - onError пересекается с пропсом DefaultInputPropsT
          onError={handleError}
          validateBeforeUpload={validateBeforeUpload}
          accept="image/*"
          size="small"
        />
      </div>
    </div>
  );
};
