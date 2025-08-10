/* eslint-disable @typescript-eslint/no-explicit-any */
import { LiveKitRoomProps } from '@livekit/components-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
};

type useCallStoreT = {
  // разрешение от браузера на использование камеры
  isCameraPermission: boolean | null;
  isMicroPermission: boolean | null;
  // включён ли у пользователя микро
  audioEnabled: boolean;
  videoEnabled: boolean;
  // id-выбранного устройства
  audioDeviceId: ConstrainDOMString | undefined;
  audioOutputDeviceId: ConstrainDOMString | undefined;
  videoDeviceId: ConstrainDOMString | undefined;
  // подключена ли конференция
  connect: LiveKitRoomProps['connect'];
  // началась ли ВКС для пользователя
  isStarted: boolean | undefined;

  mode: 'compact' | 'full';

  // Чат
  isChatOpen: boolean;
  chatMessages: ChatMessage[];
  unreadMessagesCount: number;

  updateStore: (type: keyof useCallStoreT, value: any) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearUnreadMessages: () => void;
};

export const useCallStore = create<useCallStoreT>()(
  persist(
    (set, get) => ({
      isCameraPermission: null,
      isMicroPermission: null,
      audioEnabled: false,
      videoEnabled: false,
      audioDeviceId: undefined,
      audioOutputDeviceId: undefined,
      videoDeviceId: undefined,
      connect: undefined,
      isStarted: undefined,
      mode: 'full',

      // Чат
      isChatOpen: false,
      chatMessages: [],
      unreadMessagesCount: 0,

      updateStore: (type: keyof useCallStoreT, value: any) => set({ [type]: value }),

      addChatMessage: (message: ChatMessage) => {
        const { isChatOpen, unreadMessagesCount } = get();
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
          unreadMessagesCount: isChatOpen ? unreadMessagesCount : unreadMessagesCount + 1,
        }));
      },

      clearUnreadMessages: () => set({ unreadMessagesCount: 0 }),
    }),
    {
      name: 'call-store', // Название ключа в localStorage
      partialize: (state) => ({
        isCameraPermission: state.isCameraPermission,
        isMicroPermission: state.isMicroPermission,
        audioEnabled: state.audioEnabled,
        videoEnabled: state.videoEnabled,
        audioDeviceId: state.audioDeviceId,
        videoDeviceId: state.videoDeviceId,
      }), // Сохраняем только нужные ключи
    },
  ),
);
