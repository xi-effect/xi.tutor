import { Chat } from '@xipkg/icons';
import { boardIconClass } from '../ui/boardTheme';
import { NavbarButton } from '../ui/components/shared';
import { useCommentsUiStore } from './commentsUiStore';

type CommentPlaceButtonProps = {
  className?: string;
};

/** Кнопка инструмента «поставить комментарий» в нижнем тулбаре — работает и в readonly-режиме доски. */
export const CommentPlaceButton = ({ className }: CommentPlaceButtonProps) => {
  const isPlacing = useCommentsUiStore((s) => s.isPlacing);
  const setPlacing = useCommentsUiStore((s) => s.setPlacing);
  const setCommentsVisible = useCommentsUiStore((s) => s.setCommentsVisible);

  const handleClick = () => {
    if (!isPlacing) setCommentsVisible(true);
    setPlacing(!isPlacing);
  };

  return (
    <NavbarButton
      icon={<Chat className={boardIconClass} />}
      isActive={isPlacing}
      className={className}
      data-umami-event="board-comment-place"
      data-umami-event-state={isPlacing ? 'stop' : 'start'}
      onClick={handleClick}
    />
  );
};
