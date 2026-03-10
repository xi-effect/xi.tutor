import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { ArrowLeft } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useGetClassroom } from '../../../../../../common.services/src/classrooms/useGetClassroom';

/* eslint-disable no-irregular-whitespace */
export const Header = () => {
  const navigate = useNavigate();
  const { callId } = useParams({ strict: false }) as { callId: string };

  const { data: classroom } = useGetClassroom(Number(callId));

  return (
    <div className="mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
      <div className="flex flex-row items-center gap-2">
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                navigate({
                  to: '/classrooms/$classroomId',
                  params: { classroomId: callId },
                });
              }}
              type="button"
              variant="none"
              className="flex size-[40px] min-h-[40xp] min-w-[40px] items-center justify-center rounded-[12px] p-0"
            >
              <ArrowLeft className="fill-gray-100" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            Вернуться в кабинет
          </TooltipContent>
        </Tooltip>
        <h1 className="text-xl-base font-semibold text-gray-100">Присоединиться к занятию</h1>
      </div>
      <p className="text-s-base text-gray-60 pt-0 pl-12 align-baseline sm:pt-2 sm:pl-0">
        {classroom?.name}
      </p>
    </div>
  );
};
