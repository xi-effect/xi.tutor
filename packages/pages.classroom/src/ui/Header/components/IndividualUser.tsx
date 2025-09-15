import { UserProfile } from '@xipkg/userprofile';
import { useUserById } from 'common.services';

export const IndividualUser = ({ userId }: { userId: number }) => {
  const { data: user } = useUserById(userId.toString());

  return (
    <UserProfile
      text={user?.display_name ?? user?.username}
      userId={userId}
      size="l"
      classNameText="text-m-base font-medium text-gray-100 w-full line-clamp-1"
    />
  );
};
