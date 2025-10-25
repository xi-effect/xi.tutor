import { Button } from '@xipkg/button';
import { Chat } from '@xipkg/icons';
import { useChat } from '../../hooks/useChat';
import { useCallStore } from '../../store/callStore';

export const ChatButton = () => {
  const { toggleChat } = useChat();
  const { isChatOpen, unreadMessagesCount } = useCallStore();

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleChat}
      className={`relative m-0 h-10 w-10 rounded-lg p-0 ${
        isChatOpen ? 'bg-brand-0 text-brand-100' : 'hover:bg-gray-5 text-gray-100'
      }`}
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
