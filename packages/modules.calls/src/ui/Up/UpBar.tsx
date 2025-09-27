import {
  // Grid,
  // Settings,
  // External,
  // Speaker,
  // SpeakerHorizontal,
  Link as LinkIcon,
  Maximize,
  Minimize,
  // Settings as SettingsIcon,
  ArrowLeft,
} from '@xipkg/icons';
import { useFullScreen } from 'common.utils';
// import { Settings } from './Settings';
import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { TooltipContent, Tooltip, TooltipTrigger } from '@xipkg/tooltip';
import { useCallStore } from '../../store/callStore';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetClassroom } from 'common.services';
import { toast } from 'sonner';
import { env } from 'common.env';

export const UpBar = () => {
  const { callId } = useParams({ strict: false });
  const { data: classroom } = useGetClassroom(Number(callId));
  // const [carouselType, setCarouselType] = React.useState<string>('grid');
  const { isFullScreen, toggleFullScreen } = useFullScreen('videoConferenceContainer');

  const updateStore = useCallStore((state) => state.updateStore);
  const navigate = useNavigate();

  // const toggleLayout = () => {
  //   setCarouselType((prev) => {
  //     if (prev === 'horizontal') return 'vertical';
  //     if (prev === 'vertical') return 'grid';
  //     if (prev === 'grid') return 'horizontal';
  //     return 'horizontal';
  //   });
  // };

  // useEffect(() => {
  //   if (carouselType === 'horizontal' || carouselType === 'vertical') {
  //     router.push(`${pathname}?carouselType=${carouselType}`);
  //   } else if (carouselType === 'grid') {
  //     router.push(pathname);
  //   }
  // }, [carouselType]);

  // const getViewIcon = () => {
  //   if (carouselType === 'horizontal') {
  //     return <Speaker className="fill-gray-100" />;
  //   }
  //   if (carouselType === 'vertical') {
  //     return <SpeakerHorizontal className="fill-gray-100" />;
  //   }
  //   return <Grid className="fill-gray-100" />;
  // };

  // if (!currentCall || currentCall.length === 0) return null;

  // const currentCallsCategory =
  //   typeof currentCall[0].categoryId === 'number'
  //     ? categories?.filter((item) => currentCall[0].categoryId === item.id)
  //     : null;

  const onCopyLink = () => {
    navigator.clipboard.writeText(
      `${env.VITE_APP_DOMAIN}/classrooms/${classroom?.id}?tab=overview&goto=call`,
    );
    toast.success('Ссылка скопирована. Отравьте её ученикам');
  };

  return (
    <div className={cn('flex w-full flex-row items-end px-4 pb-4', isFullScreen && 'pt-2')}>
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            onClick={() => {
              navigate({ to: '/classrooms/$classroomId', params: { classroomId: '1' } });
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
          Вернуться в кабинет
        </TooltipContent>
      </Tooltip>

      <span className="ml-4 self-center text-2xl font-semibold text-gray-100">
        {classroom?.name}
      </span>
      {/* <span className="text-gray-70 ml-2 pb-1">Имя ученика</span> */}

      {/* <Button
        onClick={toggleLayout}
        type="button"
        variant="ghost"
        className="ml-auto flex h-10 w-[95px] flex-row items-center justify-center gap-2 rounded-[12px]"
      >
        {getViewIcon()}
        <span className="text-gray-100">Вид</span>
      </Button> */}
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            onClick={onCopyLink}
            type="button"
            variant="ghost"
            className="ml-auto hidden h-10 w-10 flex-row items-center justify-center rounded-[12px] p-0 md:flex"
          >
            <LinkIcon className="fill-gray-100" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          Скопировать ссылку-приглашение
        </TooltipContent>
      </Tooltip>
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
      {/* <Settings>
        <Button
          type="button"
          variant="ghost"
          className="flex h-10 w-10 flex-row items-center justify-center rounded-[12px] p-0"
        >
          <SettingsIcon className="fill-gray-100" />
        </Button>
      </Settings> */}
    </div>
  );
};
