import { Button } from '@xipkg/button';

export const Header = () => {
  return (
    <div className="flex flex-row items-center pt-1 pr-4">
      <h1 className="text-2xl font-semibold text-gray-100">Контроль оплат</h1>

      <div className="ml-auto flex flex-row items-center gap-2">
        <Button
          size="s"
          className="text-s-base text-gray-0 rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
        >
          Создать счёт на оплату
        </Button>
      </div>
    </div>
  );
};
