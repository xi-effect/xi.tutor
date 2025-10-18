import { UserProfile } from '@xipkg/userprofile';
import { type RoleT } from '../../types';
import { useUserByRole } from '../../hooks';

export type UserCellT = {
  userId: number;
  userRole: RoleT;
};

export const UserCell = ({ userId, userRole }: UserCellT) => {
  const userHook = useUserByRole(userRole);
  const username = userHook(userId).data?.username;
  return (
    <UserProfile
      size="m"
      userId={userId}
      text={username || `Имя не найдено`}
      src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`}
    />
  );
};
