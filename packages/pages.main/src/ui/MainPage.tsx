import { ScrollArea } from '@xipkg/scrollarea';
import { Lessons, Materials, Payments, Classrooms } from './components';
import { Menu } from 'common.ui';
import { Sidebar } from './components/Sidebar';
import { Button } from '@xipkg/button';

const steps = [
  {
    element: '#sidebar',
    popover: {
      description: `Рабочее пространство в xi.effect состоит из нескольких разделов: Календарь, Кабинеты, Материалы и Контроль оплат.
Для быстрого переключения между разделами используйте боковую панель — она находится в левой части экрана.`,
    },
  },
  {
    element: '#userprofile',
    popover: {
      description: `Чтобы перейти в настройки аккаунта, нажмите на иконку вашего профиля.
В настройках можно поменять почту и пароль, подключить мессенджеры для получения уведомлений и настроить ваше оборудование для проведения видеозвонков с учениками.`,
    },
  },
];

export const MainPage = () => {
  console.log('MainPage');

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto pt-1 lg:flex-row">
      <div className="flex justify-end">
        <Button size="s" className="text-s-base text-brand-0 absolute right-4 rounded-lg px-4">
          Назначить занятие
        </Button>
      </div>
      <ScrollArea
        id="lessons"
        type="always"
        className="h-[calc(100vh-64px)] w-full flex-1 overflow-visible lg:overflow-auto"
      >
        <Lessons />
        <Classrooms />
        <Payments />
        <Materials />
        <Menu steps={steps} disabled={false} />
      </ScrollArea>
      <Sidebar />
    </div>
  );
};
