import { UserProfile } from '@xipkg/userprofile';
import { useUserById } from 'common.services';

export const IndividualUser = ({ studentId }: { studentId: number }) => {
  const { data: user } = useUserById(studentId.toString());

  console.log('user', user);

  return (
    <UserProfile
      text={user?.display_name ?? user?.username}
      userId={studentId}
      size="l"
      classNameText="text-m-base font-medium text-gray-100 w-full line-clamp-1"
    />
  );
};
