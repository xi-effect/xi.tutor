import { useState, useRef, useEffect } from 'react';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Send, Close } from '@xipkg/icons';
import { useChat } from '../../hooks/useChat';
import { useCallStore } from '../../store/callStore';
import { useCurrentUser } from 'common.services';

export const Chat = () => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendChatMessage, closeChat } = useChat();
  const { chatMessages, isChatOpen } = useCallStore();
  const { data: currentUser } = useCurrentUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendChatMessage(messageText);
      setMessageText('');
    }
  };

  if (!isChatOpen) return null;

  return (
    <div className="bg-gray-0 border-gray-20 flex h-full w-120 flex-col rounded-2xl border p-4">
      {/* Заголовок */}
      <div className="border-gray-20 flex items-center justify-between">
        <h3 className="text-m-base font-medium text-gray-100">Чат</h3>
        <Button size="icon" variant="ghost" onClick={closeChat}>
          <Close className="h-4 w-4" />
        </Button>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-gray-60 text-center">
              <p>Начните общение в чате</p>
            </div>
          ) : (
            chatMessages.map((message) => {
              const isOwnMessage = message.senderId === currentUser?.userId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      isOwnMessage ? 'bg-brand-100 text-brand-0' : 'bg-gray-10 text-gray-100'
                    }`}
                  >
                    {!isOwnMessage && (
                      <div className="text-gray-60 mb-1 text-xs font-medium">
                        {message.senderName}
                      </div>
                    )}
                    <div className="text-sm">{message.text}</div>
                    <div
                      className={`mt-1 text-xs ${isOwnMessage ? 'text-brand-20' : 'text-gray-60'}`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Поле ввода */}
      <div className="border-gray-20 flex w-full items-center gap-2">
        <div className="w-full flex-1">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Введите сообщение..."
            className="w-full border-none"
          />
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSendMessage}
          disabled={!messageText.trim()}
          className="hover:bg-gray-10 h-10 w-10"
        >
          <Send className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
