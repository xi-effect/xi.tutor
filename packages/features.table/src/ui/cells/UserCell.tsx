import { UserProfile } from '@xipkg/userprofile';
import { type RoleT } from '../../types';
import { useUserByRole } from '../../hooks';

export type UserCellT = {
  userId: number;
  userRole: RoleT;
};

export const UserCell = ({ userId, userRole }: UserCellT) => {
  const userData = useUserByRole(userRole, userId);
  const username = userData.data?.username;
  const displayName = userData.data?.display_name;
  return (
    <UserProfile
      size="m"
      userId={userId}
      text={displayName || username || `Имя не найдено`}
      src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`}
    />
  );
};
