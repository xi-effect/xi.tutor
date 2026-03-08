import { Button } from '@xipkg/button';
import { Chat } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useChat } from '../../hooks/useChat';
import { useCallStore } from '../../store/callStore';

type ChatButtonProps = {
  /** Дополнительные классы (например, для компактной панели: h-8 w-8 rounded-xl) */
  className?: string;
};

export const ChatButton = ({ className }: ChatButtonProps) => {
  const { toggleChat } = useChat();
  const { isChatOpen, unreadMessagesCount } = useCallStore();

  return (
    <Button
      size="icon"
      variant="none"
      onClick={toggleChat}
      className={cn(
        'relative m-0 p-0',
        !className && 'h-10 w-10 min-w-10 rounded-lg',
        isChatOpen ? 'bg-brand-0 text-brand-100' : 'hover:bg-gray-5 text-gray-100',
        className,
      )}
      data-umami-event="call-toggle-chat"
      data-umami-event-state={isChatOpen ? 'close' : 'open'}
    >
      <Chat />
      {unreadMessagesCount > 0 && (
        <div className="text-red-0 bg-brand-100 absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
          {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
        </div>
      )}
    </Button>
  );
};
