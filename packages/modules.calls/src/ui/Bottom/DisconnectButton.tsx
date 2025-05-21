import { useDisconnectButton } from '@livekit/components-react';
import { Endcall } from '@xipkg/icons';

export const DisconnectButton = () => {
  const { buttonProps } = useDisconnectButton({});

  return (
    <button
      type="button"
      {...buttonProps}
      className="bg-gray-0 hover:bg-red-0 border-gray-10 flex h-12 w-12 flex-row items-center justify-center rounded-[16px] border"
    >
      <Endcall className="fill-red-100" />
    </button>
  );
};
