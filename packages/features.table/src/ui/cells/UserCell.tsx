import { UserProfile } from '@xipkg/userprofile';
import { type RoleT } from '../../types';
import { useUserByRole } from 'common.services';
import { useTranslation } from 'react-i18next';

export type UserCellT = {
  userId: number;
  userRole: RoleT;
};

export const UserCell = ({ userId, userRole }: UserCellT) => {
  const { t } = useTranslation('paymentsTable');
  const userData = useUserByRole(userRole, userId);
  const username = userData.data?.username;
  const displayName = userData.data?.display_name;
  return (
    <UserProfile
      size="m"
      userId={userId}
      text={displayName || username || t('nameNotFound')}
      src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`}
    />
  );
};
