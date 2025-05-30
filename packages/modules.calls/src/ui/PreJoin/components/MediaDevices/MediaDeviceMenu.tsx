/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { RoomEvent } from 'livekit-client';
import { computeMenuPosition, wasClickOutside } from '@livekit/components-core';
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue } from '@xipkg/select';
import { Conference, Microphone, SoundTwo } from '@xipkg/icons';
import { useMaybeRoomContext, useMediaDeviceSelect } from '@livekit/components-react';
import { MediaDeviceKind, MediaDeviceSelect } from './MediaDeviceSelect';

const placeholders = {
  audioinput: 'Встроенный микрофон',
  audiooutput: 'Встроенные динамики',
  videoinput: 'Встроенная камера',
  default: 'По умолчанию',
};

export interface MediaDeviceMenuProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  kind: MediaDeviceKind;
  initialSelection: string | undefined;
  onActiveDeviceChange?: (kind: MediaDeviceKind, deviceId: string) => void;
  warnDisable?: boolean;
  requestPermissions?: boolean;
}

export const MediaDeviceMenu = ({
  warnDisable,
  kind,
  initialSelection,
  onActiveDeviceChange,
  disabled,
  requestPermissions = false,
}: MediaDeviceMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [updateRequired, setUpdateRequired] = React.useState<boolean>(true);
  const [, setNeedPermissions] = React.useState(requestPermissions);
  const button = React.useRef<HTMLButtonElement>(null);
  const tooltip = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (isOpen) {
      setNeedPermissions(true);
    }
  }, [isOpen]);

  React.useLayoutEffect(() => {
    if (button.current && tooltip.current && (devices || updateRequired)) {
      const handlePositionChange = (x: number, y: number) => {
        if (tooltip.current) {
          tooltip.current.style.left = `${x}px`;
          tooltip.current.style.top = `${y}px`;
        }
      };

      computeMenuPosition(button.current, tooltip.current, handlePositionChange);
    }
    setUpdateRequired(false);
  }, [button, tooltip, updateRequired]);

  const handleClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (!tooltip.current) {
        return;
      }
      if (event.target === button.current) {
        return;
      }
      if (isOpen && wasClickOutside(tooltip.current, event)) {
        setIsOpen(false);
      }
    },
    [isOpen, tooltip, button],
  );

  React.useEffect(() => {
    document.addEventListener<'click'>('click', handleClickOutside);
    window.addEventListener<'resize'>('resize', () => setUpdateRequired(true));
    return () => {
      document.removeEventListener<'click'>('click', handleClickOutside);
      window.removeEventListener<'resize'>('resize', () => setUpdateRequired(true));
    };
  }, [handleClickOutside, setUpdateRequired]);

  const getPlaceholder = () => {
    if (initialSelection === '') return placeholders.default;
    if (!initialSelection && kind) {
      return placeholders[kind] || placeholders.default;
    }
    return placeholders.default;
  };
  const room = useMaybeRoomContext();
  const handleError = React.useCallback(
    (e: Error) => {
      if (room) {
        room.emit(RoomEvent.MediaDevicesError, e);
      }
    },
    [room],
  );
  const { devices, setActiveMediaDevice } = useMediaDeviceSelect({
    kind,
    room,
    requestPermissions,
    onError: handleError,
  });
  async function handleActiveChange(deviceId: string, kind: MediaDeviceKind) {
    setIsOpen(false);
    onActiveDeviceChange?.(kind, deviceId);
    await setActiveMediaDevice(deviceId);
  }

  return (
    <div className={`${warnDisable ? 'border-orange-80 rounded-[8px] border-2' : null}`}>
      <Select
        onValueChange={(value) => handleActiveChange(value, kind)}
        defaultValue={devices?.length > 0 ? initialSelection : undefined}
        disabled={
          disabled || warnDisable || !devices || devices.length === 0 || devices[0].deviceId === ''
        }
      >
        <SelectTrigger
          className="flex w-full flex-row"
          before={
            <div>
              {kind === 'videoinput' && <Conference width={14} />}
              {kind === 'audiooutput' && <SoundTwo width={14} />}
              {!(kind === 'videoinput' || kind === 'audiooutput') && <Microphone width={14} />}
            </div>
          }
        >
          <SelectValue placeholder={getPlaceholder()} />
        </SelectTrigger>
        <SelectContent
          ref={(ref) => ref?.addEventListener('touchend', (e) => e.preventDefault())}
          className="w-full"
        >
          {devices.length !== 0 && devices[0].deviceId !== '' && (
            <SelectGroup>
              <MediaDeviceSelect devices={devices} />
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
