import { ScrollArea } from '@xipkg/scrollarea';
import { Lessons, Materials, Payments, Classrooms } from './components';
import { Menu } from 'common.ui';
import { Sidebar } from './components/Sidebar';
import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import { useCurrentUser } from 'common.services';

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
  const { data: user } = useCurrentUser();

  const isTutor = user.default_layout === 'tutor';
  return (
    <div className="flex h-full flex-col overflow-auto pt-1 lg:flex-row lg:gap-4">
      {isTutor && (
        <div className="absolute right-4 flex justify-end">
          <Button size="s" className="text-s-base text-brand-0 hidden rounded-lg px-4 sm:flex">
            Назначить занятие
          </Button>
          <Button
            size="s"
            className="text-s-base text-brand-0 z-50 flex w-8 rounded-lg p-0 sm:hidden"
          >
            <Plus className="fill-brand-0" />
          </Button>
        </div>
      )}
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
