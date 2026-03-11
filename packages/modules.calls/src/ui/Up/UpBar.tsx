import {
  Grid,
  Speaker,
  SpeakerHorizontal,
  Link as LinkIcon,
  Settings as SettingsIcon,
  ArrowLeft,
  Maximize,
  Minimize,
} from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { TooltipContent, Tooltip, TooltipTrigger } from '@xipkg/tooltip';
import { useCallStore } from '../../store/callStore';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useCurrentUser, useGetClassroom } from 'common.services';
import { useFocusModeStore } from 'common.ui';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { env } from 'common.env';
import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Settings } from './Settings';
import { ONBOARDING_IDS } from '../Onboarding/CallsOnboarding';
import { useMedia } from 'common.utils';

export const UpBar = () => {
  const isMobile = useMedia('(max-width: 720px)');

  const { callId } = useParams({ strict: false });
  const { data: classroom } = useGetClassroom(Number(callId));
  const carouselType = useCallStore((state) => state.carouselType);
  const { focusMode, setFocusMode, toggleFocusMode } = useFocusModeStore();

  // Сбрасываем режим фокуса при уходе со страницы звонка
  useEffect(() => {
    return () => setFocusMode(false);
  }, [setFocusMode]);

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

  const preferredFocusLayout = useCallStore((state) => state.preferredFocusLayout);

  const toggleLayout = () => {
    let nextType: 'grid' | 'horizontal' | 'vertical';

    if (isMobile) {
      nextType = carouselType === 'grid' && canUseFocusLayout ? preferredFocusLayout : 'grid';
    } else {
      if (carouselType === 'grid') {
        nextType = canUseFocusLayout ? preferredFocusLayout : 'grid';
      } else if (carouselType === preferredFocusLayout) {
        nextType = preferredFocusLayout === 'horizontal' ? 'vertical' : 'horizontal';
      } else {
        nextType = 'grid';
      }
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

  return (
    <div className="flex w-full flex-row items-end px-4 pb-1">
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            id={ONBOARDING_IDS.BACK_BUTTON}
            onClick={() => {
              if (focusMode) {
                setFocusMode(false);
              }
              navigate({
                to: '/classrooms/$classroomId',
                params: { classroomId: callId ?? '' },
                search: { tab: 'overview', call: callId },
              });
              // Ставим mode после смены маршрута, иначе эффект в Call.tsx видит «страница звонка + compact» и сбрасывает в full
              setTimeout(() => updateStore('mode', 'compact'), 0);
            }}
            type="button"
            variant="none"
            className="flex size-[40px] items-center justify-center rounded-[12px] p-0"
            data-umami-event="call-back-button"
          >
            <ArrowLeft className="fill-gray-100" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          Вернуться в кабинет. Звонок не прервется.
        </TooltipContent>
      </Tooltip>

      <span className="text-m-base sm:text-xl-base md:text-2xl-base ml-4 max-w-[50vw] min-w-0 self-center truncate font-semibold text-gray-100">
        {classroom?.name}
      </span>
      {/* <span className="text-gray-70 ml-2 pb-1">Имя ученика</span> */}
      <div className="ml-auto flex flex-row gap-2" />
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleLayout}
            type="button"
            variant="none"
            disabled={!canUseFocusLayout && carouselType === 'grid'}
            className="ml-auto flex h-10 w-[95px] flex-row items-center justify-center gap-2 rounded-[12px] px-0 disabled:opacity-50"
            data-umami-event="call-toggle-layout"
            data-umami-event-layout={carouselType}
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
      {!isMobile && (
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleFocusMode}
              type="button"
              variant="none"
              className="ml-2 flex h-10 w-10 flex-row items-center justify-center rounded-[12px] p-0"
              data-umami-event="call-toggle-focus-mode"
              data-umami-event-state={focusMode ? 'exit' : 'enter'}
            >
              {focusMode ? (
                <Minimize className="fill-gray-100" />
              ) : (
                <Maximize className="fill-gray-100" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            {focusMode ? 'Показать меню и шапку' : 'Скрыть меню и шапку'}
          </TooltipContent>
        </Tooltip>
      )}
      {isTutor && (
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              id={ONBOARDING_IDS.LINK_BUTTON}
              onClick={onCopyLink}
              type="button"
              variant="none"
              className="ml-2 hidden h-10 w-10 flex-row items-center justify-center rounded-[12px] p-0 md:flex"
              data-umami-event="call-copy-link"
            >
              <LinkIcon className="fill-gray-100" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            Скопировать ссылку-приглашение
          </TooltipContent>
        </Tooltip>
      )}
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
          variant="none"
          className="flex h-10 w-10 flex-row items-center justify-center rounded-[12px] p-0"
          data-umami-event="call-settings-button"
        >
          <SettingsIcon className="fill-gray-100" />
        </Button>
      </Settings>
    </div>
  );
};
