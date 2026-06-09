import { materialAccessBadgeClasses } from 'common.ui';
import { AccessModeT } from 'common.types';

export const accessModeLabels: Record<AccessModeT, string> = {
  read_write: 'совместная работа',
  read_only: 'только репетитор',
  no_access: 'черновик',
};

export const accessModeStyles: Record<AccessModeT, string> = materialAccessBadgeClasses;
