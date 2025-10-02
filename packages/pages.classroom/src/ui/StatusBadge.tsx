import { Badge } from '@xipkg/badge';
import { cn } from '@xipkg/utils';

import { StatusEducationT, TypeEducationT } from '../types';

type StatusBadgePropsT = {
  status: StatusEducationT;
  kind: TypeEducationT;
  deleted?: boolean;
};

const statusMap: Record<string, string> = {
  active: 'Учится',
  paused: 'На паузе',
  locked: 'Заблокировано',
  finished: 'Обучение завершено',
};

export const StatusBadge = ({ status, deleted }: StatusBadgePropsT) => {
  const styles = 'rounded-lg border-none px-2 py-1 font-medium text-s-base';

  if (deleted) {
    return (
      <Badge size="m" className={cn(styles, 'text-gray-80 bg-gray-5')}>
        {statusMap[status]}
      </Badge>
    );
  }

  switch (status) {
    case 'active':
      return (
        <Badge variant="success" size="m" className={cn(styles, 'text-green-80 bg-green-0')}>
          {statusMap[status]}
        </Badge>
      );

    case 'paused':
      return (
        <Badge variant="destructive" size="m" className={cn(styles, 'text-orange-80 bg-orange-0')}>
          {statusMap[status]}
        </Badge>
      );

    case 'locked':
      return (
        <Badge variant="destructive" size="m" className={cn(styles, 'text-red-80 bg-red-0')}>
          {statusMap[status]}
        </Badge>
      );

    case 'finished':
      return (
        <Badge size="m" className={cn(styles, 'text-gray-80 bg-gray-5')}>
          {statusMap[status]}
        </Badge>
      );

    default:
      return null;
  }
};
