import { Button } from '@xipkg/button';

export const Board = () => {
  const handleBoard = () => {
    console.log('board add');
  };

  return (
    <Button
      onClick={() => handleBoard()}
      size="s"
      className="text-s-base text-gray-0 rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
    >
      Создать доску
    </Button>
  );
};
