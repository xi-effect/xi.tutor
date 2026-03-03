import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { Button } from '@xipkg/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Account, Maximize, Users, WhiteBoard } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { DevicesBar } from '../shared';
import { DisconnectButton } from '../Bottom/DisconnectButton';
import { ScreenShareButton } from '../Bottom/ScreenShareButton';
import { ChatButton } from '../Bottom/ChatButton';
import { RaiseHandButton } from '../Bottom/RaiseHandButton';

type CompactCallDevicesProps = {
  microTrack: LocalAudioTrack | undefined;
  microEnabled: boolean;
  microTrackToggle: {
    showIcon: boolean;
    source: import('livekit-client').Track.Source;
    onChange: () => void;
  };
  videoTrack: LocalVideoTrack | undefined;
  videoEnabled: boolean;
  videoTrackToggle: {
    showIcon: boolean;
    source: import('livekit-client').Track.Source;
    onChange: () => void;
  };
};

type CompactCallBottomBarProps = {
  withOutShadows: boolean;
  devices: CompactCallDevicesProps;
  isMobile: boolean;
  compactViewMode: 'basic' | 'expanded';
  onViewModeToggle: () => void;
  showBackToBoardButton: boolean;
  onBackToBoard: () => void;
  onMaximize: (syncToAll?: boolean) => void;
  isTutor: boolean;
};

export function CompactCallBottomBar({
  withOutShadows,
  devices,
  isMobile,
  compactViewMode,
  onViewModeToggle,
  showBackToBoardButton,
  onBackToBoard,
  onMaximize,
  isTutor,
}: CompactCallBottomBarProps) {
  const barCn = cn(
    'bg-gray-0 border-gray-20 flex items-center justify-center rounded-2xl border p-1',
    withOutShadows ? '' : 'shadow-lg',
  );

  return (
    <div className="flex h-[40px] flex-row">
      <div className={barCn}>
        <DevicesBar
          className="h-[32px] w-[32px]"
          microTrack={devices.microTrack}
          microEnabled={devices.microEnabled}
          microTrackToggle={devices.microTrackToggle}
          videoTrack={devices.videoTrack}
          videoEnabled={devices.videoEnabled}
          videoTrackToggle={devices.videoTrackToggle}
        />
      </div>

      {!isMobile && (
        <div className={cn(barCn, 'ml-1')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="none"
                onClick={onViewModeToggle}
                className="hover:bg-gray-5 h-8 w-8 rounded-xl p-0 text-gray-100"
                aria-label={compactViewMode === 'basic' ? 'Развёрнутый вид' : 'Один участник'}
              >
                {compactViewMode === 'basic' ? (
                  <Users className="h-5 w-5" />
                ) : (
                  <Account className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {compactViewMode === 'basic'
                ? 'Развёрнутый вид (несколько участников)'
                : 'Один участник'}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {showBackToBoardButton && (
        <div className={cn(barCn, 'ml-1')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="primary"
                className="h-8 w-8 rounded-xl p-0"
                onClick={onBackToBoard}
                aria-label="На доску"
              >
                <WhiteBoard className="fill-gray-0 h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Обратно на доску</TooltipContent>
          </Tooltip>
        </div>
      )}

      <div className={cn(barCn, 'ml-auto')}>
        <ScreenShareButton className="h-[32px] w-[32px]" />
        <ChatButton className="h-8 w-8 min-w-8 rounded-xl" />
        <RaiseHandButton className="h-[32px] w-[32px]" />
      </div>

      <div className={cn(barCn, 'ml-1')}>
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
                onClick={() => onMaximize(false)}
                className="text-gray-80 cursor-pointer text-sm"
              >
                Только меня
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onMaximize(true)}
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
                onClick={() => onMaximize(false)}
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
  );
}
