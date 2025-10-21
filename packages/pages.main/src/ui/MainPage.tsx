import { useState } from 'react';
import { ScrollArea } from '@xipkg/scrollarea';
import { Materials, Payments, Classrooms } from './components';
import { Menu } from 'common.ui';
// import { Sidebar } from './components/Sidebar';
import { AssignLessonButton } from './components/AssignLessonButton';
import { AddingLessonModal } from 'features.lesson.add';

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
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenAddingModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className="flex h-full flex-col overflow-auto lg:flex-row lg:gap-4">
        <AssignLessonButton
          className="absolute right-4 bottom-4 z-50"
          onButtonClick={handleOpenAddingModal}
        />
        <ScrollArea
          id="lessons"
          type="always"
          className="h-[calc(100vh-64px)] w-full flex-1 overflow-visible lg:overflow-auto"
        >
          {/* <Lessons /> */}
          <Classrooms />
          <Payments />
          <Materials />
          <Menu steps={steps} disabled={false} />
        </ScrollArea>
        {/* <Sidebar /> */}
      </div>
      <AddingLessonModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
