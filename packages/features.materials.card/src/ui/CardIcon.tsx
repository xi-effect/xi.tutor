import { LongAnswer, WhiteBoard } from '@xipkg/icons';

const iconClassName = 'size-6 fill-gray-100';

export const cardIcon: Record<'note' | 'board', React.ReactNode> = {
  note: <LongAnswer className={iconClassName} aria-label="note" />,
  board: <WhiteBoard className={iconClassName} aria-label="board" />,
};
