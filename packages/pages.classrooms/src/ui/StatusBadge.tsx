import { Badge } from '@xipkg/badge';

import { StatusEducationT, ClassroomPropsT } from '../types';

export const statusBadge = (
  status: StatusEducationT,
  groupSize?: ClassroomPropsT['groupSize'],
  deleted?: ClassroomPropsT['deleted'],
) => {
  const statusMap: Record<string, string> = {
    study: 'Учится',
    group: 'Учатся',
    pause: 'На паузе',
    completed: 'Обучение завершено',
  };

  if (deleted) {
    return (
      <Badge size="m" className="text-gray-80 bg-gray-5 rounded-lg border-none px-2 py-1">
        {statusMap[status]}
      </Badge>
    );
  }

  switch (status) {
    case 'study':
      return (
        <Badge
          variant="success"
          size="m"
          className="text-green-80 bg-green-0 rounded-lg border-none px-2 py-1"
        >
          {groupSize ? statusMap['group'] : statusMap[status]}
        </Badge>
      );
    case 'pause':
      return (
        <Badge
          variant="destructive"
          size="m"
          className="text-orange-80 bg-orange-0 rounded-lg border-none px-2 py-1"
        >
          {statusMap[status]}
        </Badge>
      );
    case 'completed':
      return (
        <Badge size="m" className="text-gray-80 bg-gray-5 rounded-lg border-none px-2 py-1">
          {statusMap[status]}
        </Badge>
      );
    default:
      return null;
  }
};
