import { Button } from '@xipkg/button';

export const Header = () => {
  return (
    <div className="flex flex-row items-center">
      <h1 className="text-2xl font-semibold text-gray-100">Кабинеты</h1>

      <div className="ml-auto flex flex-row items-center gap-2">
        <Button
          variant="secondary"
          size="s"
          className="text-s-base border-gray-60 rounded-lg border px-4 py-2 font-medium text-gray-100 max-[550px]:hidden"
        >
          Создать группу
        </Button>

        <Button
          size="s"
          className="text-s-base text-gray-0 rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
        >
          Пригласить
        </Button>
      </div>
    </div>
  );
};
