import { Button } from '@xipkg/button';

interface BoardProps {
  onCreate: () => void;
}

export const Board = ({ onCreate }: BoardProps) => {
  return (
    <Button
      onClick={onCreate}
      size="s"
      variant="secondary"
      className="rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
    >
      Создать доску
    </Button>
  );
};
