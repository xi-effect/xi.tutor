import { Button } from '@xipkg/button';
import { ModalInvitation } from './ModalInvitation';

export const ButtonsHeader = () => {
  return (
    <div className="ml-auto flex flex-row items-center gap-2 pr-4 max-sm:hidden">
      <Button
        variant="secondary"
        size="s"
        className="text-s-base border-gray-60 rounded-lg border px-4 py-2 font-medium text-gray-100 max-[550px]:hidden"
      >
        Создать группу
      </Button>

      <ModalInvitation>
        <Button
          size="s"
          className="text-s-base text-gray-0 rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
        >
          Пригласить
        </Button>
      </ModalInvitation>
    </div>
  );
};
