import { ScrollArea } from '@xipkg/scrollarea';
import { Lessons, Materials, Payments, Classrooms } from './components';
import { Menu } from 'common.ui';

export const MainPage = () => {
  console.log('MainPage');
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

  return (
    <div className="flex flex-col pt-1">
      <ScrollArea id="lessons" type="always" className="h-[calc(100vh-64px)] w-full">
        <Lessons />
        <Classrooms />
        <Payments />
        <Materials />
        <Menu steps={steps} disabled={false} />
      </ScrollArea>
    </div>
  );
};
