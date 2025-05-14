import { Button } from '@xipkg/button';
import { FileUploader } from '@xipkg/fileuploader';

export const Header = () => {
  return (
    <div className="flex flex-row items-center">
      <h1 className="text-2xl font-semibold text-gray-100">Материалы</h1>

      <div className="ml-auto flex flex-row items-center gap-2">
        <FileUploader onChange={() => {}} multiple={true} descriptionText="Загрузить файл">
          <div className="text-s-base px-4 py-2 font-medium text-gray-100 max-sm:hidden">
            Загрузить файл
          </div>
        </FileUploader>

        <Button
          variant="secondary"
          size="medium"
          className="text-s-base max-xs:hidden px-4 py-2 font-medium text-gray-100"
        >
          Создать заметку
        </Button>

        <Button size="medium" className="text-s-base max-xs:hidden px-4 py-2 font-medium">
          Создать доску
        </Button>
      </div>
    </div>
  );
};
