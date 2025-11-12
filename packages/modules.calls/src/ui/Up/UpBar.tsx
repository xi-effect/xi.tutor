import { useEffect } from 'react';
import {
  Grid,
  Speaker,
  SpeakerHorizontal,
  Link as LinkIcon,
  Settings as SettingsIcon,
  Maximize,
  Minimize,
  ArrowLeft,
} from '@xipkg/icons';
import { useFullScreen } from 'common.utils';
import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { TooltipContent, Tooltip, TooltipTrigger } from '@xipkg/tooltip';
import { useCallStore } from '../../store/callStore';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useCurrentUser, useGetClassroom } from 'common.services';
import { toast } from 'sonner';
import { env } from 'common.env';
import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Settings } from './Settings';
import { ONBOARDING_IDS } from '../Onboarding/CallsOnboarding';

export const UpBar = () => {
  const { callId } = useParams({ strict: false });
  const { data: classroom } = useGetClassroom(Number(callId));
  const carouselType = useCallStore((state) => state.carouselType);
  const { isFullScreen, toggleFullScreen } = useFullScreen('videoConferenceContainer');

  // Получаем треки для проверки условий
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: true },
  );

  // Проверяем условия для FocusLayout
  const hasScreenShare = tracks.some(
    (track) =>
      track.publication?.source === Track.Source.ScreenShare && track.publication?.isSubscribed,
  );
  const participantCount = tracks.filter(
    (track) => track.publication?.source === Track.Source.Camera,
  ).length;
  const canUseFocusLayout = hasScreenShare || participantCount > 2;

  const updateStore = useCallStore((state) => state.updateStore);
  const navigate = useNavigate();

  const toggleLayout = () => {
    const currentType = carouselType;
    let nextType: 'grid' | 'horizontal' | 'vertical';

    if (currentType === 'horizontal') nextType = 'vertical';
    else if (currentType === 'vertical') nextType = 'grid';
    else if (currentType === 'grid') {
      // Если условия не соблюдены, остаемся на grid
      nextType = canUseFocusLayout ? 'horizontal' : 'grid';
    } else {
      nextType = 'grid';
    }

    updateStore('carouselType', nextType);
  };

  const getViewIcon = () => {
    if (carouselType === 'horizontal') {
      return <Speaker className="fill-gray-100" />;
    }
    if (carouselType === 'vertical') {
      return <SpeakerHorizontal className="fill-gray-100" />;
    }

    return <Grid className="fill-gray-100" />;
  };

  const onCopyLink = () => {
    navigator.clipboard.writeText(
      `${env.VITE_APP_DOMAIN}/classrooms/${classroom?.id}?tab=overview&goto=call`,
    );
    toast.success('Ссылка скопирована. Отравьте её ученикам');
  };

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  useEffect(() => {
    const root = document.documentElement;
    if (isFullScreen) {
      root.style.setProperty('--header-height', '0px');
    } else {
      root.style.setProperty('--header-height', '64px');
    }
  }, [isFullScreen]);

  return (
    <div className={cn('flex w-full flex-row items-end px-4 pb-4', isFullScreen && 'pt-2')}>
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            id={ONBOARDING_IDS.BACK_BUTTON}
            onClick={() => {
              navigate({
                to: '/classrooms/$classroomId',
                params: { classroomId: callId ?? '' },
                search: { tab: 'overview', call: callId },
              });
              updateStore('mode', 'compact');
            }}
            type="button"
            variant="ghost"
            className="flex size-[40px] items-center justify-center rounded-[12px] p-0"
          >
            <ArrowLeft className="fill-gray-100" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          Вернуться в кабинет. Звонок не прервется.
        </TooltipContent>
      </Tooltip>

      <span className="ml-4 self-center text-2xl font-semibold text-gray-100">
        {classroom?.name}
      </span>
      {/* <span className="text-gray-70 ml-2 pb-1">Имя ученика</span> */}
      <div className="ml-auto flex flex-row gap-2" />
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleLayout}
            type="button"
            variant="ghost"
            disabled={!canUseFocusLayout && carouselType === 'grid'}
            className="ml-auto flex h-10 w-[95px] flex-row items-center justify-center gap-2 rounded-[12px] disabled:opacity-50"
          >
            {getViewIcon()}
            <span className="text-gray-100">Вид</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          {!canUseFocusLayout && carouselType === 'grid'
            ? 'Нужно больше 2 участников или демонстрация экрана для переключения вида'
            : 'Переключить вид сетки'}
        </TooltipContent>
      </Tooltip>
      {isTutor && (
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              id={ONBOARDING_IDS.LINK_BUTTON}
              onClick={onCopyLink}
              type="button"
              variant="ghost"
              className="ml-2 hidden h-10 w-10 flex-row items-center justify-center rounded-[12px] p-0 md:flex"
            >
              <LinkIcon className="fill-gray-100" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            Скопировать ссылку-приглашение
          </TooltipContent>
        </Tooltip>
      )}
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleFullScreen}
            type="button"
            variant="ghost"
            className="ml-2 hidden h-10 w-10 flex-row items-center justify-center rounded-[12px] p-0 md:flex"
          >
            {isFullScreen ? (
              <Minimize className="fill-gray-100" />
            ) : (
              <Maximize className="fill-gray-100" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          {isFullScreen ? 'Свернуть' : 'Развернуть на весь экран'}
        </TooltipContent>
      </Tooltip>
      {/* <button
        type="button"
      className="bg-gray-0 ml-2 flex h-10 w-10 flex-row items-center justify-center rounded-[20px]"
      >
        <External className="fill-gray-100" />
      </button> */}
      <Settings>
        <Button
          id={ONBOARDING_IDS.SETTINGS_BUTTON}
          type="button"
          variant="ghost"
          className="flex h-10 w-10 flex-row items-center justify-center rounded-[12px] p-0"
        >
          <SettingsIcon className="fill-gray-100" />
        </Button>
      </Settings>
    </div>
  );
};
