import { RefObject } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';

export type AvatarPreviewPropsT = {
  date: RefObject<'' | Date>;
  userId: number | null;
};

export const AvatarPreview = ({ date, userId }: AvatarPreviewPropsT) => (
  <Avatar size="xl">
    <AvatarImage
      src={`https://auth.xieffect.ru/api/users/${userId}/avatar.webp?=${date.current instanceof Date ? date.current.getTime() : ''}`}
      alt="user avatar"
    />
    <AvatarFallback size="xl" />
  </Avatar>
);
