/* eslint-disable no-irregular-whitespace */
import { ScrollArea } from '@xipkg/scrollarea';
import { Materials, Payments, Classrooms } from './components';
import { Menu } from 'common.ui';
import { useCurrentUser } from 'common.services';
// import { Sidebar } from './components/Sidebar';
// import { AssignLessonButton } from './components/AssignLessonButton';

export const MainPage = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const steps = [
    {
      element: '#sidebar',
      popover: {
        description: `Используйте панель слева, чтобы открыть Главную страницу, Кабинеты, Материалы или Контроль оплат`,
      },
    },
    {
      element: '#userprofile',
      popover: {
        description: `${
          isTutor
            ? 'В настройках можно поменять почту и пароль, подключить мессенджеры для получения уведомлений и настроить ваше оборудование для проведения видеозвонков с учениками'
            : 'В настройках можно поменять почту и пароль, подключить мессенджеры для уведомлений и настроить видеозвонки'
        }`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#classrooms-menu-item',
      popover: {
        description: `Кабинет — виртуальное пространство для учёбы. В кабинете вы найдёте материалы, расписание и информацию об оплатах`,
      },
    },
    {
      element: '#invite-student-button',
      popover: {
        description: `${
          isTutor
            ? 'Отправьте ученику ссылку-приглашение'
            : 'Переходите по ссылкам-приглашениям от репетиторов, чтобы добавлять новые кабинеты'
        }`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#create-group-button',
      popover: {
        description: `Или создайте группу и приглашайте учеников по общей ссылке.<br />
Если вы назначите групповое занятие, каждый ученик группы получит уведомление.
Материалы группы доступны всем её участникам`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#materials-menu-item',
      popover: {
        description: `Храните онлайн-доски и заметки в Материалах`,
      },
      side: 'right' as const,
      align: 'start' as const,
    },
    {
      element: '#payments-menu-item',
      popover: {
        description: `Контроль оплат поможет вам отслеживать все финансы внутри платформы: предстоящие, совершённые и просроченные платежи`,
      },
    },
    {
      element: '#create-invoice-button',
      popover: {
        description: `Чтобы получить оплату за занятие, выставите ученику счёт.<br />
Если ученик не оплатит счет, вам не придется напоминать ему об этом: он получит автоматическое уведомление о просроченном платеже`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#hints-button',
      popover: {
        description: `Если нужна помощь, нажмите сюда, чтобы посмотреть подсказки заново, или напишите в поддержку.<br />Желаем удачи!<br />Команда sovlium`,
      },
      side: 'right' as const,
      align: 'end' as const,
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-auto lg:flex-row lg:gap-4">
      {/* <AssignLessonButton className="absolute right-4 hidden lg:flex" /> */}
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
  );
};
