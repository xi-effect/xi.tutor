import { UserProfile } from '@xipkg/userprofile';

type StudentPropsT = {
  id: number;
  name?: string;
  description?: string;
  avatarUrl?: string;
};

export const StudentCell = ({ id, name, description, avatarUrl }: StudentPropsT) => {
  return <UserProfile size="m" userId={id} text={name} label={description} src={avatarUrl ?? ''} />;
};
