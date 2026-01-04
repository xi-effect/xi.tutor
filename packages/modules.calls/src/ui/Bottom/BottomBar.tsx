import {
  ControlBarProps,
  useLocalParticipant,
  // useLocalParticipantPermissions,
  usePersistentUserChoices,
  useTrackToggle,
} from '@livekit/components-react';
import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { DevicesBar } from '../shared/DevicesBar/DevicesBar';
import { useCallback } from 'react';
import { DisconnectButton } from './DisconnectButton';
import { ScreenShareButton } from './ScreenShareButton';
import { WhiteBoardButton } from './WhiteBoardButton';
import { RaiseHandButton } from './RaiseHandButton';
import { ChatButton } from './ChatButton';
import { useCurrentUser } from 'common.services';
import { useCallStore } from '../../store';
import { cn } from '@xipkg/utils';
import { useNavigate } from '@tanstack/react-router';
import { WhiteBoard } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { Button } from '@xipkg/button';
import { useModeSync } from '../../hooks';
import { useRoom } from '../../providers/RoomProvider';

export const BottomBar = ({ saveUserChoices = true }: ControlBarProps) => {
  const { saveAudioInputEnabled, saveVideoInputEnabled } = usePersistentUserChoices({
    preventSave: !saveUserChoices,
  });

  const { isMicrophoneEnabled, isCameraEnabled, microphoneTrack, cameraTrack } =
    useLocalParticipant();

  // Используем useTrackToggle для правильного управления треками (как в Settings)
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

  // Обработчики включения/выключения (как в Settings)
  const handleMicrophoneToggle = useCallback(async () => {
    microphoneToggle.toggle();
  }, [microphoneToggle]);

  const handleCameraToggle = useCallback(async () => {
    cameraToggle.toggle();
  }, [cameraToggle]);

  const { isChatOpen, mode, activeBoardId, activeClassroom, token } = useCallStore();
  const updateStore = useCallStore((state) => state.updateStore);
  const { room } = useRoom();

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const navigate = useNavigate();
  const { syncModeToOthers } = useModeSync();

  // Показываем кнопку "обратно к доске" только если:
  // 1. Пользователь в full mode
  // 2. Есть активная доска (activeBoardId и activeClassroom)
  // 3. Комната подключена (чтобы не показывать кнопку при отключении или до подключения)
  const showBackToBoardButton =
    mode === 'full' &&
    activeBoardId &&
    activeClassroom &&
    room &&
    token &&
    room.state === 'connected';

  const handleBackToBoard = () => {
    if (!activeBoardId || !activeClassroom) {
      return;
    }

    // Проверяем, что комната подключена (чтобы не терять ВКС)
    if (!room || !token || room.state !== 'connected') {
      return;
    }

    // Обновляем режим в store ПЕРЕД навигацией
    updateStore('mode', 'compact');

    // Синхронизируем режим с другими участниками (если был collaborative mode)
    syncModeToOthers('compact', activeBoardId, activeClassroom);

    // Переходим на доску с обязательным параметром call для сохранения ВКС
    navigate({
      to: '/classrooms/$classroomId/boards/$boardId',
      params: { classroomId: activeClassroom, boardId: activeBoardId },
      search: { call: activeClassroom },
      replace: false, // Не заменяем историю, чтобы можно было вернуться
    });
  };

  return (
    <div className={cn('relative w-full', isChatOpen && 'invisible sm:visible')}>
      <div className="flex w-full flex-row justify-between p-4">
        <div />
        <div className="flex flex-row gap-4">
          <div className="bg-gray-0 border-gray-10 flex h-[48px] w-[92px] items-center justify-center gap-1 rounded-[16px] border">
            <DevicesBar
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
              className="relative"
            />
          </div>
          <div className="bg-gray-0 border-gray-10 flex h-[48px] items-center justify-center gap-1 rounded-[16px] border p-1">
            <ScreenShareButton />
            {isTutor && <WhiteBoardButton />}
            <ChatButton />
            <RaiseHandButton />
          </div>
        </div>
        <div className="relative flex flex-row items-center justify-center gap-4">
          {showBackToBoardButton && (
            <Tooltip delayDuration={1000}>
              <TooltipTrigger asChild>
                <Button
                  size="m"
                  variant="default"
                  onClick={handleBackToBoard}
                  className="bg-brand-100 hover:bg-brand-80 absolute top-1 left-[-132px] m-0 h-10 w-[128px] rounded-xl"
                >
                  <WhiteBoard className="fill-gray-0" />
                  <span className="ml-2">К доске</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                Вернуться к доске для совместной работы
              </TooltipContent>
            </Tooltip>
          )}
          <div className="bg-gray-0 border-gray-10 flex h-[48px] w-[48px] items-center justify-center gap-1 rounded-[16px] border p-1">
            <DisconnectButton />
          </div>
        </div>
      </div>
    </div>
  );
};
