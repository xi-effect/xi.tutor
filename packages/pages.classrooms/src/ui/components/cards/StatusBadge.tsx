import { Badge } from '@xipkg/badge';

import { StatusEducationT, TypeEducationT } from '../../../types';
import { educationUtils } from 'common.entities';
import { useCurrentUser } from 'common.services';

type StatusBadgePropsT = {
  status: StatusEducationT;
  kind: TypeEducationT;
  deleted?: boolean;
};

export const StatusBadge = ({ status, deleted }: StatusBadgePropsT) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const statusText = educationUtils.getStatusTextByRole(status, isTutor);

  if (deleted) {
    return (
      <Badge size="m" className="text-gray-80 bg-gray-5 rounded-lg border-none px-2 py-1">
        {statusText}
      </Badge>
    );
  }

  switch (status) {
    case 'active':
      return (
        <Badge
          variant="success"
          size="m"
          className="text-green-80 bg-green-0 rounded-lg border-none px-2 py-1"
        >
          {statusText}
        </Badge>
      );

    case 'paused':
      return (
        <Badge
          variant="destructive"
          size="m"
          className="text-orange-80 bg-orange-0 rounded-lg border-none px-2 py-1"
        >
          {statusText}
        </Badge>
      );

    case 'locked':
      return (
        <Badge
          variant="destructive"
          size="m"
          className="text-red-80 bg-red-0 rounded-lg border-none px-2 py-1"
        >
          {statusText}
        </Badge>
      );

    case 'finished':
      return (
        <Badge size="m" className="text-gray-80 bg-gray-5 rounded-lg border-none px-2 py-1">
          {statusText}
        </Badge>
      );

    default:
      return null;
  }
};
