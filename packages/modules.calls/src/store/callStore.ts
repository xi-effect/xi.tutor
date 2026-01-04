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

type RaisedHand = {
  participantId: string;
  participantName: string;
  timestamp: number;
};

export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

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
  // состояние подключения
  isConnecting: boolean;

  mode: 'compact' | 'full';
  carouselType: 'grid' | 'horizontal' | 'vertical';
  activeCorner: Corner;

  // Текущая активная доска (для синхронизации с новыми участниками)
  activeBoardId: string | undefined;
  activeClassroom: string | undefined;

  // токен для конференции
  token: string | undefined;

  // Чат
  isChatOpen: boolean;
  chatMessages: ChatMessage[];
  unreadMessagesCount: number;

  // Поднятые руки
  raisedHands: RaisedHand[];
  isHandRaised: boolean;

  updateStore: (type: keyof useCallStoreT, value: any) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearUnreadMessages: () => void;
  addRaisedHand: (hand: RaisedHand) => void;
  removeRaisedHand: (participantId: string) => void;
  toggleHandRaised: () => void;
  clearAllRaisedHands: () => void;
  isHandRaisedByParticipant: (participantId: string) => boolean;
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
      isConnecting: false,
      mode: 'full',
      carouselType: 'grid',
      activeCorner: 'top-left',

      // Текущая активная доска
      activeBoardId: undefined,
      activeClassroom: undefined,

      // токен для конференции
      token: undefined,

      // Чат
      isChatOpen: false,
      chatMessages: [],
      unreadMessagesCount: 0,

      // Поднятые руки
      raisedHands: [],
      isHandRaised: false,

      updateStore: (type: keyof useCallStoreT, value: any) => set({ [type]: value }),

      addChatMessage: (message: ChatMessage) => {
        const { isChatOpen, unreadMessagesCount, chatMessages } = get();

        // Проверяем, нет ли уже сообщения с таким ID (дедупликация)
        const messageExists = chatMessages.some((msg) => msg.id === message.id);
        if (messageExists) {
          return;
        }

        set((state) => ({
          chatMessages: [...state.chatMessages, message],
          unreadMessagesCount: isChatOpen ? unreadMessagesCount : unreadMessagesCount + 1,
        }));
      },

      clearUnreadMessages: () => set({ unreadMessagesCount: 0 }),

      // Поднятые руки
      addRaisedHand: (hand: RaisedHand) =>
        set((state) => {
          // Проверяем, есть ли уже рука от этого участника
          const existingHand = state.raisedHands.find(
            (h) => h.participantId === hand.participantId,
          );
          if (existingHand) {
            // Обновляем существующую руку
            return {
              raisedHands: state.raisedHands.map((h) =>
                h.participantId === hand.participantId ? hand : h,
              ),
            };
          }
          // Добавляем новую руку
          return { raisedHands: [...state.raisedHands, hand] };
        }),
      removeRaisedHand: (participantId: string) =>
        set((state) => ({
          raisedHands: state.raisedHands.filter((hand) => hand.participantId !== participantId),
        })),
      toggleHandRaised: () => set((state) => ({ isHandRaised: !state.isHandRaised })),
      clearAllRaisedHands: () => set({ raisedHands: [], isHandRaised: false }),
      isHandRaisedByParticipant: (participantId: string) => {
        const state = get();
        return state.raisedHands.some((hand) => hand.participantId === participantId);
      },
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
        carouselType: state.carouselType,
        activeCorner: state.activeCorner,
      }), // Сохраняем только нужные ключи
    },
  ),
);
