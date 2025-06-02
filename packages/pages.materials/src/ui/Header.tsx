import { Button } from '@xipkg/button';

export const Header = () => {
  return (
    <div className="flex flex-row items-center pr-4">
      <h1 className="text-2xl font-semibold text-gray-100">Материалы</h1>

      <div className="ml-auto flex flex-row items-center gap-2">
        <Button
          size="s"
          variant="ghost"
          className="text-s-base rounded-lg px-4 py-2 font-medium text-gray-100 max-sm:hidden"
        >
          Загрузить файл
        </Button>

        <Button
          variant="secondary"
          size="s"
          className="text-s-base border-gray-60 rounded-lg border px-4 py-2 font-medium text-gray-100 max-[550px]:hidden"
        >
          Создать заметку
        </Button>

        <Button
          size="s"
          className="text-s-base text-gray-0 rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
        >
          Создать доску
        </Button>
      </div>
    </div>
  );
};
