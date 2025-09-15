import { Badge } from '@xipkg/badge';
import { Telegram } from '@xipkg/icons';
import { ClassroomTutorResponseSchema } from 'common.api';
import { getStatusText, getStatusVariant, handleTelegramClick } from '../../../utils/header';
import { IndividualUser } from './IndividualUser';
import { EditableDescription } from './EditableDescription';

interface ContentProps {
  classroom: ClassroomTutorResponseSchema;
}

export const Content = ({ classroom }: ContentProps) => {
  const getDisplayName = () => {
    if (classroom.kind === 'individual') {
      return `${classroom.student.first_name} ${classroom.student.last_name}`;
    } else {
      return classroom.title;
    }
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

      <div className="ml-auto flex flex-row items-center gap-2">
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
    </div>
  );
};
