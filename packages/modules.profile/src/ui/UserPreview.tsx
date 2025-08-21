import React, { ChangeEvent, useRef } from 'react';
import { Camera, Edit, Trash } from '@xipkg/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { AvatarEditor } from 'features.avatar.editor';
import { useCurrentUser } from 'common.services';
import { env } from 'common.env';
import { getAxiosInstance } from 'common.config';

const readFile = (file: File) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });

type UserPreviewPropsT = {
  className?: string;
};

export const UserPreview = ({ className = '' }: UserPreviewPropsT) => {
  const { data: user } = useCurrentUser();

  const [isAvatarOpen, setIsAvatarOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | unknown>();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleMenuEditClick = () => {
    inputRef.current?.click();
  };

  const handleDeleteAvatar = async () => {
    const axiosInstance = await getAxiosInstance();
    const response = await axiosInstance({
      method: 'DELETE',
      url: `${env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/users/current/avatar/`,
    });

    if (response.status === 204) {
      toast('Аватарка удалена. Скоро она исчезнет с сайта');
    } else {
      toast('Ошибка при удалении аватарки');
    }
  };

  const handleInput = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const file = event.target.files[0];

    if (!file.type.startsWith('image/')) {
      toast('Пожалуйста, загрузите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('Файл слишком большой');
      return;
    }

    const imageDataUrl = await readFile(file);

    setFile(imageDataUrl);
    setIsAvatarOpen(true);
  };

  const date = React.useRef<'' | Date>('');

  const setDate = (value: Date) => {
    date.current = value;
  };

  return (
    <div
      className={`border-gray-80 flex h-[120px] w-full items-center rounded-2xl border p-6 ${className}`}
    >
      <AvatarEditor
        file={file}
        open={isAvatarOpen}
        onOpenChange={setIsAvatarOpen}
        setDate={setDate}
      />
      <input
        className="hidden"
        ref={inputRef}
        onChange={handleInput}
        type="file"
        accept="image/*"
      />
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer" asChild>
          <Avatar size="xl">
            <AvatarImage
              src={`https://api.sovlium.ru/files/users/${user?.id}/avatar.webp`}
              alt="user avatar"
            />
            <AvatarFallback
              size="xl"
              className="bg-gray-5 flex h-[64px] w-[64px] place-items-center justify-center rounded-[36px]"
            >
              <Camera className="fill-gray-60" />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[220px]">
          <DropdownMenuItem onClick={handleMenuEditClick}>
            <Edit className="mr-2 h-5 w-5" />
            <span className="text-[14px]">Изменить миниатюру</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeleteAvatar}>
            <Trash className="mr-2 h-5 w-5" />
            <span className="text-[14px]">Удалить</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="ml-4 flex flex-col justify-center gap-0.5">
        <span className="text-2xl leading-[32px] font-semibold">{user?.display_name}</span>
        <span className="text-gray-80 text-[16px] leading-[22px]">{user?.username}</span>
      </div>
    </div>
  );
};
