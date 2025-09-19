/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Badge } from '@xipkg/badge';
import { Telegram, Conference } from '@xipkg/icons';
import { ClassroomTutorResponseSchema } from 'common.api';
import { getStatusText, getStatusVariant, handleTelegramClick } from '../../../utils/header';
import { IndividualUser } from './IndividualUser';
import { EditableDescription } from './EditableDescription';
import { Button } from '@xipkg/button';
import { useNavigate } from '@tanstack/react-router';
import { SubjectBadge } from './SubjectBadge';

interface ContentProps {
  classroom: ClassroomTutorResponseSchema;
}

export const Content = ({ classroom }: ContentProps) => {
  const navigate = useNavigate();

  const getDisplayName = () => {
    if (classroom.kind === 'individual') {
      return `${classroom.student.first_name} ${classroom.student.last_name}`;
    } else {
      return classroom.title;
    }
  };

  const handleCallClick = () => {
    console.log('handleCallClick');

    navigate({
      // @ts-ignore
      to: '/call/$classroomId',
      // @ts-ignore
      params: { classroomId: classroom.id },
    });
  };

  return (
    <div className="flex flex-row items-center pl-4">
      <div className="flex flex-col items-start gap-1">
        {classroom.kind === 'individual' ? (
          <IndividualUser userId={classroom.student_id ?? classroom.tutor_id ?? 0} />
        ) : (
          <div className="text-m-base text-gray-60 font-medium">{getDisplayName()}</div>
        )}
        <EditableDescription description={classroom.description} classroomId={classroom.id} />
      </div>

      <div className="ml-auto flex flex-col items-end gap-2">
        <div className="flex flex-row items-center gap-2">
          {classroom.subject_id && <SubjectBadge subject_id={classroom.subject_id} />}
          <Badge variant={getStatusVariant(classroom.status)} size="m">
            {getStatusText(classroom.status)}
          </Badge>

          <Badge
            className="cursor-pointer"
            onClick={handleTelegramClick}
            variant="secondary"
            size="m"
          >
            <Telegram className="fill-brand-80 mr-2 size-4" />
            {`@nickname`}
          </Badge>
        </div>
        <div className="flex flex-row items-end gap-2">
          <Button onClick={handleCallClick} size="s">
            <Conference className="fill-gray-0 mr-2 size-4" />
            {`Начать Звонок`}
          </Button>
        </div>
      </div>
    </div>
  );
};
