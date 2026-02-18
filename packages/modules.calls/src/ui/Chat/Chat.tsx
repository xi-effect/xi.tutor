import { useState, useRef, useEffect } from 'react';
import { Button } from '@xipkg/button';
import { Textarea } from '@xipkg/textarea';
import { Send, Close } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';
import { ScrollArea } from '@xipkg/scrollarea';
import { useChat } from '../../hooks/useChat';
import { useCallStore } from '../../store/callStore';
import { useCurrentUser } from 'common.services';
import { cn } from '@xipkg/utils';
import { parseLinks } from '../../utils/chat';

export const Chat = () => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendChatMessage, closeChat } = useChat();
  const { chatMessages, isChatOpen } = useCallStore();
  const { data: currentUser } = useCurrentUser();

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      requestAnimationFrame(() => {
        scrollToBottom('auto');
      });
    }
  }, [isChatOpen]);

  // Автоматическая прокрутка при получении новых сообщений
  useEffect(() => {
    if (isChatOpen && chatMessages.length > 0) {
      requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });
    }
  }, [chatMessages.length, isChatOpen]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendChatMessage(messageText);
      setMessageText('');
      requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDownSendMessage = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter без Shift - отправка сообщения
    // Shift+Enter - перенос строки (разрешаем стандартное поведение)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Если Shift+Enter, не предотвращаем стандартное поведение - будет перенос строки
  };

  if (!isChatOpen) return null;

  return (
    <div className="bg-gray-0 border-gray-0 sm:border-gray-20 fixed flex h-full w-full max-w-none min-w-[328px] flex-col overflow-hidden rounded-2xl border p-4 pr-1 sm:relative sm:max-w-[328px]">
      {/* Заголовок */}
      <div className="border-gray-20 flex items-center justify-between pr-3">
        <h3 className="text-lg font-medium text-gray-100">Чат</h3>
        <Button size="icon" variant="none" onClick={closeChat}>
          <Close className="h-6 w-6" aria-label="Закрыть чат" />
        </Button>
      </div>

      {/* Сообщения */}
      <ScrollArea className="flex-1 py-2 pr-3">
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
                    <div className="flex flex-row items-center gap-1 text-xs font-medium text-gray-100">
                      {!isOwnMessage && (
                        <UserProfile
                          size="s"
                          userId={Number(message.senderId)}
                          text={message.senderName}
                          src={`https://api.sovlium.ru/files/users/${message.senderId}/avatar.webp`}
                        />
                      )}
                      <div
                        className={`text-xs-base ${isOwnMessage ? 'text-brand-20 ml-auto' : 'text-gray-60'}`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'cursor-text rounded-lg px-3 py-2 text-sm wrap-break-word whitespace-pre-wrap select-text',
                        isOwnMessage ? 'bg-brand-20' : 'bg-gray-5',
                      )}
                    >
                      {parseLinks(message.text)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Поле ввода */}
      <div className="flex items-end gap-2 pr-3">
        <div className="border-gray-20 flex max-h-40 w-full flex-1 items-center rounded-xl border pl-4">
          <Textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Напишите сообщение..."
            className="my-3 max-h-32 min-w-full rounded-none border-none p-0 pr-2"
            onKeyDown={handleKeyDownSendMessage}
          />
          <div className="pr-1">
            <Button
              size="icon"
              variant="primary"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="rounded-xl p-2"
            >
              <Send
                className={cn(
                  'fill-gray-0 h-6 w-6 group-hover:fill-gray-100',
                  !messageText.trim() && 'fill-gray-100',
                )}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
