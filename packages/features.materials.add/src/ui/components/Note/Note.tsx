import { Button } from '@xipkg/button';

export const Note = () => {
  const handleNote = () => {
    console.log('note add');
  };

  return (
    <Button
      onClick={() => handleNote()}
      variant="secondary"
      size="s"
      className="text-s-base border-gray-60 rounded-lg border px-4 py-2 font-medium text-gray-100 max-[550px]:hidden"
    >
      Создать заметку
    </Button>
  );
};
