import { Button } from '@xipkg/button';

export const File = () => {
  const handleUpload = () => {
    console.log('upload');
  };

  return (
    <Button
      onClick={() => handleUpload()}
      size="s"
      variant="ghost"
      className="text-s-base rounded-lg px-4 py-2 font-medium text-gray-100 max-sm:hidden"
    >
      Загрузить файл
    </Button>
  );
};
