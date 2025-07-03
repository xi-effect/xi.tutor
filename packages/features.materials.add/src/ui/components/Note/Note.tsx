import { Button } from '@xipkg/button';

interface NoteProps {
  onCreate: () => void;
}

export const Note = ({ onCreate }: NoteProps) => {
  return (
    <Button
      onClick={onCreate}
      variant="secondary"
      size="s"
      className="text-s-base border-gray-60 rounded-lg border px-4 py-2 font-medium text-gray-100 max-[550px]:hidden"
    >
      Создать заметку
    </Button>
  );
};
