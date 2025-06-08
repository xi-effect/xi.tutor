import { Badge } from '@xipkg/badge';
import { Button } from '@xipkg/button';
import { UserProfile } from '@xipkg/userprofile';

export const Lesson = () => {
  return (
    <div className="border-gray-60 flex min-h-[184px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4">
      <div className="flex w-full flex-row items-center justify-between">
        <UserProfile userId={1} text="Анна Смирнова" />
        <Badge variant="success" size="s">
          Оплачено
        </Badge>
      </div>

      <h3 className="text-l-base font-medium text-gray-100">Past simple</h3>
      <div className="flex flex-row items-center justify-start gap-2">
        <span className="text-s-base text-gray-80 font-medium">Сегодня, 12:00–12:40</span>
        <span className="text-xs-base text-gray-60 font-medium">40 минут</span>
      </div>
      <Button
        variant="secondary"
        className="bg-brand-0 text-brand-100 hover:text-brand-80 hover:bg-brand-10 mt-auto h-8 self-end rounded-lg border-none"
      >
        Начать занятие
      </Button>
    </div>
  );
};
