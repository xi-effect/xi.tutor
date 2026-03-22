/* eslint-disable no-irregular-whitespace */
import { Classrooms, Lessons, Payments, Materials } from './components';
import { DateTimeDisplay, Menu } from 'common.ui';
import { useCurrentUser } from 'common.services';

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
      element: '#userprofile',
      popover: {
        description: `${isTutor ? '' : 'Переходите по ссылкам-приглашениям от репетиторов, чтобы добавлять новые кабинеты'}`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#invite-student-button',
      popover: {
        description: 'Отправьте ученику ссылку-приглашение',
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
        description: `${
          isTutor
            ? 'Если нужна помощь, нажмите сюда, чтобы посмотреть подсказки заново, или напишите в поддержку.<br />Желаем удачи!<br />Команда sovlium'
            : 'Если нужна помощь, посмотрите подсказки заново или напишите в поддержку.<br />Отличной учёбы!<br />Команда sovlium'
        }`,
      },
      side: 'right' as const,
      align: 'end' as const,
    },
  ];

  return (
    <div className="bg-gray-5 flex h-full min-h-0 flex-col">
      {/* Шапка на всю ширину контентной области; не участвует в прокрутке ниже */}
      <div className="shrink-0 pt-6 pr-4 pb-5 pl-4">
        <DateTimeDisplay />
      </div>
      {/* Ниже шапки — оставшаяся высота; справа один скролл по кабинетам / оплатам / материалам */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-row items-start gap-4 pb-6 pl-4">
          <div className="lg:bg-gray-5 flex shrink-0 flex-col lg:sticky lg:top-0 lg:z-10 lg:self-start">
            <Lessons />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 self-stretch overflow-y-auto overscroll-contain">
            <Classrooms />
            <Payments />
            <Materials />
          </div>
        </div>
      </div>
      <Menu steps={steps} disabled={false} />
    </div>
  );
};
