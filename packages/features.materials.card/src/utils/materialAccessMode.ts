import { AccessModeT } from 'common.types';

export const accessModeLabels: Record<AccessModeT, string> = {
  read_write: 'совместная работа',
  read_only: 'только репетитор',
  no_access: 'черновик',
};

export const accessModeStyles: Record<AccessModeT, string> = {
  read_write: 'bg-gray-10 text-gray-60',
  read_only: 'bg-cyan-20 text-cyan-100',
  no_access: 'bg-violet-20 text-violet-100',
};
