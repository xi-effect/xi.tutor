import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';

export type AvatarPreviewPropsT = {
  userId: number | null;
};

export const AvatarPreview = ({ userId }: AvatarPreviewPropsT) => (
  <Avatar size="xl">
    <AvatarImage
      src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`}
      alt="user avatar"
    />
    <AvatarFallback size="xl" />
  </Avatar>
);
