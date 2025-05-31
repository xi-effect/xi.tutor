import { Badge } from '@xipkg/badge';
import { Telegram, WhatsAppFilled } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';

export const Header = () => {
  const handleTelegramClick = () => {
    window.open('https://t.me/nickname', '_blank');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/nickname', '_blank');
  };

  return (
    <div className="flex flex-row items-center pl-4">
      <div className="flex flex-col items-start gap-1">
        <UserProfile
          text={'Иванов Иван'}
          userId={1}
          size="l"
          classNameText="text-m-base font-medium text-gray-100 w-full line-clamp-1"
        />
        <div className="text-m-base text-gray-60 font-medium">Английский язык</div>
      </div>

      <div className="ml-auto flex flex-row items-center gap-2">
        <Badge variant="success" size="m">
          Учится
        </Badge>

        <Badge
          className="cursor-pointer"
          onClick={handleTelegramClick}
          variant="secondary"
          size="m"
        >
          <Telegram className="fill-brand-80 mr-2 size-4" />
          {`@nickname`}
        </Badge>
        <Badge className="cursor-pointer" onClick={handleWhatsAppClick} variant="success">
          <WhatsAppFilled className="fill-green-80 mr-2 size-4" />
          {`@nickname`}
        </Badge>
      </div>
    </div>
  );
};
