import { useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DevicesBar } from '../shared';
import {
  useLocalParticipant,
  usePersistentUserChoices,
  useTrackToggle,
} from '@livekit/components-react';
import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { DisconnectButton } from '../Bottom/DisconnectButton';
import { useCompactNavigation } from '../../hooks/useCompactNavigation';
import { Maximize } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallStore } from '../../store/callStore';
import { CompactNavigationControls } from './CompactNavigationControls';
import { ParticipantTile } from '../Participant';
import { ScreenShareButton } from '../Bottom/ScreenShareButton';
import { RaiseHandButton } from '../Bottom/RaiseHandButton';
import { useVideoBlur, useModeSync } from '../../hooks';
import { useRoom } from '../../providers/RoomProvider';
import { useCurrentUser } from 'common.services';

export const CompactCall = ({ saveUserChoices = true }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable-call',
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: 'move',
  };

  const { saveAudioInputEnabled, saveVideoInputEnabled } = usePersistentUserChoices({
    preventSave: !saveUserChoices,
  });

  const { isMicrophoneEnabled, isCameraEnabled, microphoneTrack, cameraTrack } =
    useLocalParticipant();

  const videoTrack = cameraTrack?.track as LocalVideoTrack | undefined;

  // Применяем блюр только в компактном режиме
  const mode = useCallStore((state) => state.mode);
  const videoTrackForBlur = mode === 'compact' ? videoTrack : null;
  useVideoBlur(videoTrackForBlur);

  // Используем useTrackToggle для правильного управления треками (как в BottomBar)
  const microphoneToggle = useTrackToggle({
    source: Track.Source.Microphone,
    onChange: (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) {
        saveAudioInputEnabled(enabled);
      }
    },
  });

  const cameraToggle = useTrackToggle({
    source: Track.Source.Camera,
    onChange: (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) {
        saveVideoInputEnabled(enabled);
      }
    },
  });

  // Обработчики включения/выключения (как в BottomBar)
  const handleMicrophoneToggle = useCallback(async () => {
    microphoneToggle.toggle();
  }, [microphoneToggle]);

  const handleCameraToggle = useCallback(async () => {
    cameraToggle.toggle();
  }, [cameraToggle]);

  // Навигация по участникам (только если есть комната)
  const navigation = useCompactNavigation();
  const {
    currentParticipant,
    currentIndex,
    totalParticipants,
    canGoNext,
    canGoPrev,
    goToNext,
    goToPrev,
  } = navigation;

  // Безопасно получаем параметры call из URL
  const search = useSearch({ strict: false }) as { call?: string };
  const { call } = search;

  const navigate = useNavigate();
  const updateStore = useCallStore((state) => state.updateStore);
  const { syncModeToOthers } = useModeSync();
  const activeBoardId = useCallStore((state) => state.activeBoardId);
  const activeClassroom = useCallStore((state) => state.activeClassroom);
  const { room } = useRoom();
  const token = useCallStore((state) => state.token);
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const handleMaximize = (syncToAll: boolean = false) => {
    // Проверяем, что комната подключена (чтобы не терять ВКС)
    if (!room || !token || room.state !== 'connected') {
      return;
    }

    // Переключаем режим на full
    updateStore('mode', 'full');

    if (isTutor && activeBoardId && activeClassroom) {
      if (syncToAll) {
        // Сохраняем activeClassroom перед очисткой для передачи в сообщении
        const classroomId = activeClassroom;

        // Если синхронизируем со всеми, очищаем информацию о доске
        updateStore('activeBoardId', undefined);
        updateStore('activeClassroom', undefined);
        // Отправляем сообщение всем участникам о переключении на full (без boardId, но с classroom)
        // Это сигнал для всех участников, что работа с доской завершена
        // Передаем classroom, чтобы студенты могли перейти на страницу конференции
        syncModeToOthers('full', undefined, classroomId);
      }
      // Если syncToAll = false, не отправляем сообщение другим участникам
      // Они останутся на доске, а репетитор переключится только локально
    }

    // Переходим на страницу конференции с сохранением параметра call
    navigate({
      to: '/call/$callId',
      params: { callId: call ?? activeClassroom ?? '' },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      search: call || activeClassroom ? { call: call || activeClassroom } : undefined,
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex w-[320px] flex-col"
    >
      {/* Видео текущего участника */}
      <div className="bg-gray-0 border-gray-20 group relative mb-2 flex h-[180px] w-[320px] items-center justify-center overflow-hidden rounded-2xl border shadow-lg">
        {currentParticipant ? (
          <ParticipantTile
            trackRef={currentParticipant}
            participant={currentParticipant.participant}
            className="h-full w-full"
            isFocusToggleDisable={true}
          />
        ) : (
          <div className="bg-gray-40 flex h-full w-full items-center justify-center text-gray-100">
            <span className="text-sm">Нет участников</span>
          </div>
        )}

        {/* Элементы управления навигацией - только если есть участники */}
        {totalParticipants > 0 && (
          <CompactNavigationControls
            canPrev={canGoPrev}
            canNext={canGoNext}
            onPrev={goToPrev}
            onNext={goToNext}
            currentIndex={currentIndex}
            totalParticipants={totalParticipants}
          />
        )}
      </div>
      <div className="flex h-[40px] flex-row">
        <div className="bg-gray-0 border-gray-20 flex items-center justify-center gap-1 rounded-2xl border p-1 shadow-lg">
          <DevicesBar
            className="h-[32px] w-[32px]"
            microTrack={microphoneTrack?.track as LocalAudioTrack}
            microEnabled={isMicrophoneEnabled}
            microTrackToggle={{
              showIcon: true,
              source: Track.Source.Microphone,
              onChange: handleMicrophoneToggle,
            }}
            videoTrack={cameraTrack?.track as unknown as LocalVideoTrack}
            videoEnabled={isCameraEnabled}
            videoTrackToggle={{
              showIcon: true,
              source: Track.Source.Camera,
              onChange: handleCameraToggle,
            }}
          />
        </div>
        <div className="bg-gray-0 border-gray-20 ml-auto flex items-center justify-center rounded-2xl border p-1 shadow-lg">
          <ScreenShareButton className="h-[32px] w-[32px]" />
          {/* <ChatButton /> */}
          <RaiseHandButton className="h-[32px] w-[32px]" />
        </div>
        <div className="bg-gray-0 border-gray-20 ml-1 flex items-center justify-center rounded-2xl border p-1 shadow-lg">
          {isTutor ? (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="none"
                      className="hover:bg-gray-5 relative m-0 h-8 w-8 rounded-xl p-0 text-gray-100"
                    >
                      <Maximize className="fill-gray-100" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Вернуться в конференцию</TooltipContent>
              </Tooltip>
              <DropdownMenuContent side="top" align="end" className="z-1000 min-w-[200px]">
                <DropdownMenuLabel className="text-gray-60 text-sm">
                  Вернуть в конференцию
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleMaximize(false)}
                  className="text-gray-80 cursor-pointer text-sm"
                >
                  Только меня
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMaximize(true)}
                  className="text-gray-80 cursor-pointer text-sm"
                >
                  Всех участников
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="none"
                  onClick={() => handleMaximize(false)}
                  className="hover:bg-gray-5 relative m-0 h-8 w-8 rounded-xl p-0 text-gray-100"
                >
                  <Maximize className="fill-gray-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Вернуться в конференцию</TooltipContent>
            </Tooltip>
          )}
          <DisconnectButton className="h-[32px] w-[32px] rounded-xl" />
        </div>
      </div>
    </div>
  );
};
