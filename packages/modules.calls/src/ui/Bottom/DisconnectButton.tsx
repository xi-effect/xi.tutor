import { useDisconnectButton } from '@livekit/components-react';
import { Endcall } from '@xipkg/icons';
import { useCallStore } from '../../store/callStore';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';

export const DisconnectButton = ({ className }: { className?: string }) => {
  const { buttonProps } = useDisconnectButton({});

  const updateStore = useCallStore((state) => state.updateStore);

  const handleDisconnect = () => {
    buttonProps.onClick?.();
    updateStore('isStarted', false);
    updateStore('connect', false);
  };

  return (
    <Button
      variant="ghost"
      type="button"
      disabled={buttonProps.disabled}
      onClick={handleDisconnect}
      className={cn(
        'bg-gray-0 hover:bg-red-0 flex h-12 w-12 flex-row items-center justify-center rounded-[16px] p-0',
        className,
      )}
    >
      <Endcall className="fill-red-100" />
    </Button>
  );
};
