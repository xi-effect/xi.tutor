import { Button } from '@xipkg/button';
import { useCurrentUser } from 'common.services';

export const Header = ({ onCreateInvoice }: { onCreateInvoice: () => void }) => {
  const { data: user } = useCurrentUser();

  return (
    <div className="flex flex-row items-center pt-1 pr-4 pb-4">
      <h1 className="text-2xl font-semibold text-gray-100">Контроль оплат</h1>

      {user?.default_layout === 'tutor' && (
        <div className="ml-auto flex flex-row items-center gap-2">
          <Button
            size="s"
            className="text-s-base text-gray-0 rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
            onClick={onCreateInvoice}
          >
            Создать счёт на оплату
          </Button>
        </div>
      )}
    </div>
  );
};
