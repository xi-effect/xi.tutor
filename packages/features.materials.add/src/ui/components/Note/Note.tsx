import { Button } from '@xipkg/button';

interface NoteProps {
  onCreate: () => void;
}

export const Note = ({ onCreate }: NoteProps) => {
  return (
    <Button
      onClick={onCreate}
      variant="ghost"
      size="s"
      className="text-s-base rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
    >
      Создать заметку
    </Button>
  );
};
