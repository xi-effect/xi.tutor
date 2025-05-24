import { useDisconnectButton } from '@livekit/components-react';
import { Endcall } from '@xipkg/icons';
import { useCallStore } from '../../store/callStore';

export const DisconnectButton = () => {
  const { buttonProps } = useDisconnectButton({});

  const updateStore = useCallStore((state) => state.updateStore);

  const handleDisconnect = () => {
    buttonProps.onClick?.();
    updateStore('isStarted', false);
    updateStore('connect', false);
  };

  return (
    <button
      type="button"
      {...buttonProps}
      onClick={handleDisconnect}
      className="bg-gray-0 hover:bg-red-0 border-gray-10 flex h-12 w-12 flex-row items-center justify-center rounded-[16px] border"
    >
      <Endcall className="fill-red-100" />
    </button>
  );
};
