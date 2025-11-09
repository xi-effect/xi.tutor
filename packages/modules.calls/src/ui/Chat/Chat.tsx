import { useState, useRef, useEffect } from 'react';
import { Button } from '@xipkg/button';
import { Textarea } from '@xipkg/textarea';
import { Send, Close } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendChatMessage(messageText);
      setMessageText('');
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  if (!isChatOpen) return null;

  return (
    <div className="bg-gray-0 border-gray-20 flex h-full max-w-[328px] min-w-[328px] flex-col overflow-y-auto rounded-2xl border p-4">
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
              const isOwnMessage = Number(message.senderId) === Number(currentUser?.id);
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex max-w-[90%] flex-col gap-1 rounded-lg text-gray-100 select-text">
                    {!isOwnMessage && (
                      <div className="flex flex-row items-center gap-1 text-xs font-medium text-gray-100">
                        <UserProfile
                          size="s"
                          userId={Number(message.senderId)}
                          text={message.senderName}
                          src={`https://api.sovlium.ru/files/users/${message.senderId}/avatar.webp`}
                        />
                        <div
                          className={`text-xs-base ${isOwnMessage ? 'text-brand-20' : 'text-gray-60'}`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    )}
                    <div
                      className={`cursor-text rounded-lg px-3 py-2 text-sm wrap-break-word select-text ${isOwnMessage ? 'bg-brand-20' : 'bg-gray-5'}`}
                    >
                      {message.text}
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
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 border-none px-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
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
