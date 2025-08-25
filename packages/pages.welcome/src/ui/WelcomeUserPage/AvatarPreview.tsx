import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';

export type AvatarPreviewPropsT = {
  userId: number | null;
  timestamp?: number;
};

export const AvatarPreview = ({ userId, timestamp }: AvatarPreviewPropsT) => {
  const [imageKey, setImageKey] = React.useState(0);

  React.useEffect(() => {
    if (timestamp) {
      setImageKey((prev) => prev + 1);
    }
  }, [timestamp]);

  return (
    <Avatar size="xl">
      <AvatarImage
        key={imageKey}
        src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp${timestamp ? `?t=${timestamp}` : ''}`}
        alt="user avatar"
      />
      <AvatarFallback size="xl" />
    </Avatar>
  );
};
