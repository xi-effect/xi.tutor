import { Button } from '@xipkg/button';
import { InfoCircle } from '@xipkg/icons';
import { Alert, AlertIcon, AlertContainer, AlertDescription, AlertTitle } from '@xipkg/alert';

interface NoteForStudentProps {
  onHide: () => void;
  isTutor: boolean;
}

export const NoteForStudent = ({ onHide, isTutor }: NoteForStudentProps) => {
  return (
    <Alert className="h-[170px] max-w-[320px] min-w-[320px]" variant="brand">
      <AlertIcon>
        <InfoCircle className="fill-brand-100" />
      </AlertIcon>
      <AlertContainer className="h-full">
        <AlertTitle>{isTutor ? 'Как начать занятие' : 'Подсказка'}</AlertTitle>
        <AlertDescription>
          {isTutor
            ? 'Нажмите «Начать занятие», чтобы перейти в видеозвонок. Ученик получит уведомление'
            : 'Когда репетитор начнёт занятие, кнопка «Присоединиться» станет активной'}
        </AlertDescription>
        <Button
          size="s"
          className="border-brand-100 text-brand-100 hover:bg-brand-100 hover:text-brand-0 mt-auto w-full border bg-transparent"
          variant="none"
          onClick={onHide}
        >
          Скрыть
        </Button>
      </AlertContainer>
    </Alert>
  );
};
