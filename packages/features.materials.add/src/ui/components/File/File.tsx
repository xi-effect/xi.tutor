import { Button } from '@xipkg/button';

interface FileProps {
  onUpload: () => void;
}

export const File = ({ onUpload }: FileProps) => {
  return (
    <Button
      onClick={onUpload}
      size="s"
      variant="none"
      className="text-s-base rounded-lg px-4 py-2 font-medium text-gray-100 max-sm:hidden"
    >
      Загрузить файл
    </Button>
  );
};
