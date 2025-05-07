import { Toggle } from '@xipkg/toggle';

type TypesMessagersT = 'telegram' | 'whatsapp' | 'email';

type NotificationsTogglesPropsT = {
  type: TypesMessagersT;
};

const typeMap: Record<string, string> = {
  telegram: 'Telegram',
  whatsapp: 'Whatsapp',
  email: 'Email',
};

export const NotificationsToggles = ({ type }: NotificationsTogglesPropsT) => {
  const nameType = typeMap[type] || 'Email';

  return (
    <>
      <div className="flex flex-col gap-2">
        {type !== 'email' && (
          <div className="flex flex-row items-center justify-between p-3">
            <div className="flex flex-col gap-1">
              <span className="font-inter text-m-base font-medium">
                Отображать ник в {nameType} в профиле
              </span>

              <span className="text-gray-80 font-inter text-s-base font-normal">
                Другие участники увидят ваши контакты
              </span>
            </div>

            <Toggle size="l" />
          </div>
        )}

        <div className="flex flex-row items-center justify-between p-3">
          <div className="flex flex-col gap-1">
            <span className="font-inter text-m-base font-medium">Начало занятия</span>

            <span className="text-gray-80 font-inter text-s-base font-normal">
              Позволяет участникам просматривать все категории
            </span>
          </div>

          <Toggle size="l" />
        </div>

        <div className="flex flex-row items-center justify-between p-3">
          <div className="flex flex-col gap-1">
            <span className="font-inter text-m-base font-medium">Оплата</span>

            <span className="text-gray-80 font-inter text-s-base font-normal">
              Позволяет участникам редактировать права ролей, которые ниже их самой роли
            </span>
          </div>

          <Toggle size="l" />
        </div>
      </div>
    </>
  );
};
