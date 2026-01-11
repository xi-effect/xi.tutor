import { Button } from '@xipkg/button';
import { useCurrentUser } from 'common.services';
import { Plus } from '@xipkg/icons';

export const Header = ({ onCreateInvoice }: { onCreateInvoice: () => void }) => {
  const { data: user } = useCurrentUser();

  return (
    <div className="flex flex-row items-center pt-1 pr-4 pb-4">
      <h1 className="text-2xl font-semibold text-gray-100">Контроль оплат</h1>

      {user?.default_layout === 'tutor' && (
        <div className="ml-auto flex flex-row items-center gap-2">
          <Button
            size="s"
            className="text-s-base text-gray-0 xs:px-4 rounded-lg px-2 py-2 font-medium"
            onClick={onCreateInvoice}
          >
            <span className="xs:flex hidden">Создать счёт на оплату</span>
            <Plus size="sm" className="fill-brand-0 xs:hidden flex" />
          </Button>
        </div>
      )}
    </div>
  );
};
