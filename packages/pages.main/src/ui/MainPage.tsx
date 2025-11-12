/* eslint-disable no-irregular-whitespace */
import { useState } from 'react';
import { ScrollArea } from '@xipkg/scrollarea';
import { Materials, Payments, Classrooms } from './components';
import { Menu } from 'common.ui';
import { useCurrentUser } from 'common.services';
// import { Sidebar } from './components/Sidebar';
import { AssignLessonButton } from './components/AssignLessonButton';
import { AddingLessonModal } from 'features.lesson.add';

export const MainPage = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenAddingModal = () => {
    setIsOpen(true);
  };

  const steps = [
    {
      element: '#sidebar',
      popover: {
        description: `Используйте панель слева, чтобы открыть Главную страницу, Кабинеты${isTutor ? ', Материалы' : ''} или Контроль оплат`,
      },
    },
    {
      element: '#userprofile',
      popover: {
        description: `В настройках можно поменять почту и пароль, установить аватар, поменять отображаемое имя и подключить мессенджеры для получения уведомлений`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#classrooms-menu-item',
      popover: {
        description: `Кабинет — виртуальное пространство для работы с учениками и группами.
В кабинете вы можете увидеть расписание занятий, сохраненные материалы и информацию об оплатах`,
      },
    },
    {
      element: '#invite-student-button',
      popover: {
        description: `Приглашайте учеников в sovlium с помощью ссылок-приглашений`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#create-group-button',
      popover: {
        description: `Или создайте группу и приглашайте учеников по общей ссылке.
Если вы назначите групповое занятие, каждый ученик группы получит уведомление.
Материалы и заметки, которые вы разместите в групповом кабинете, будут доступны всем ученикам группы`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#materials-menu-item',
      popover: {
        description: `«В Материалах» вы можете просматривать личные сохраненные учебные доски и заметки. Дублирование в кабинет позволит поделиться материалами с учениками, создав копию материала в кабинете`,
      },
      side: 'right' as const,
      align: 'start' as const,
    },
    {
      element: '#create-invoice-button',
      popover: {
        description: `Чтобы получить оплату за занятие, выставите ученику счёт.
Если ученик не оплатит счет, вам не придется напоминать ему об этом: он получит автоматическое уведомление о просроченном платеже`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#payments-menu-item',
      popover: {
        description: `Контроль оплат поможет вам отслеживать все финансы внутри платформы: предстоящие, совершённые и просроченные платежи`,
      },
    },
  ];

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
          {isTutor && <Materials />}
          <Menu steps={steps} disabled={false} />
        </ScrollArea>
        {/* <Sidebar /> */}
      </div>
      <AddingLessonModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
