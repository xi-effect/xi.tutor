import { Button } from '@xipkg/button';

export const Header = () => {
  return (
    <div className="flex flex-row">
      <h1 className="text-2xl font-bold">Кабинеты</h1>
      <Button className="ml-auto" variant="primary">
        Создать группу
      </Button>
      <Button className="ml-2" variant="primary">
        Пригласить
      </Button>
    </div>
  );
};
