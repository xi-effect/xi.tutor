/**
 * Sharer side of remote control (Electron shell): announces availability,
 * handles requests and forwards the controller's input to the shell.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { RoomEvent, type Participant } from 'livekit-client';
import {
  getRemoteControlStatus,
  requestRemoteControlAccess,
  sendRemoteInput,
  setRemoteControlActive,
  type RemoteControlStatus,
} from 'common.platform';
import {
  REMOTE_CONTROL_TOPIC,
  decodeRemoteControl,
  encodeRemoteControl,
  type RemoteControlMessage,
} from './protocol';

/** Picks up the Accessibility switch without restarting the share. */
const STATUS_POLL_MS = 2000;

export type RemoteControlHost = {
  status: RemoteControlStatus | null;
  /** Identity of the participant in control. */
  controller: string | null;
  /** Identity of the participant waiting for an answer. */
  pending: string | null;
  grant(identity: string): void;
  revoke(): void;
  deny(): void;
  requestAccess(): void;
};

export function useRemoteControlHost(enabled: boolean): RemoteControlHost {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [status, setStatus] = useState<RemoteControlStatus | null>(null);
  const [controller, setController] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const available = enabled && Boolean(status?.supported);
  const controllerRef = useRef(controller);
  controllerRef.current = controller;
  const availableRef = useRef(available);
  availableRef.current = available;

  const publish = useCallback(
    (message: RemoteControlMessage, identities?: string[]) => {
      void localParticipant
        .publishData(encodeRemoteControl(message), {
          reliable: true,
          topic: REMOTE_CONTROL_TOPIC,
          destinationIdentities: identities,
        })
        .catch((err) => {
          console.warn('[modules.calls] remote control message failed', err);
        });
    },
    [localParticipant],
  );

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: number | undefined;
    const refresh = () => {
      void getRemoteControlStatus()
        .then((next) => {
          if (cancelled) return;
          setStatus(next);
          if (next.supported && !next.trusted) timer = window.setTimeout(refresh, STATUS_POLL_MS);
        })
        .catch((err) => {
          console.warn('[modules.calls] remote control status failed', err);
        });
    };
    refresh();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled]);

  useEffect(() => {
    if (enabled) return;
    setController(null);
    setPending(null);
  }, [enabled]);

  useEffect(() => {
    if (!available) return;
    publish({ type: 'state', available: true, controller });
  }, [available, controller, publish]);

  useEffect(() => {
    if (!available) return;
    return () => publish({ type: 'state', available: false, controller: null });
  }, [available, publish]);

  const active = available && controller !== null && Boolean(status?.trusted);
  useEffect(() => {
    void setRemoteControlActive(active).catch((err) => {
      console.warn('[modules.calls] remote control toggle failed', err);
    });
    if (!active) return;
    return () => {
      void setRemoteControlActive(false).catch(() => undefined);
    };
  }, [active]);

  useEffect(() => {
    const onData = (
      payload: Uint8Array,
      participant?: Participant,
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== REMOTE_CONTROL_TOPIC || !participant) return;
      const message = decodeRemoteControl(payload);
      if (!message) return;
      const identity = participant.identity;

      switch (message.type) {
        case 'input':
          if (identity === controllerRef.current) sendRemoteInput(message.input);
          return;
        case 'request':
          if (!availableRef.current) {
            publish({ type: 'state', available: false, controller: null }, [identity]);
          } else if (identity !== controllerRef.current) {
            setPending(identity);
          }
          return;
        case 'release':
          if (identity === controllerRef.current) setController(null);
          return;
        default:
      }
    };

    const onJoined = (participant: Participant) => {
      if (!availableRef.current) return;
      publish({ type: 'state', available: true, controller: controllerRef.current }, [
        participant.identity,
      ]);
    };

    const onLeft = (participant: Participant) => {
      setController((current) => (current === participant.identity ? null : current));
      setPending((current) => (current === participant.identity ? null : current));
    };

    room.on(RoomEvent.DataReceived, onData);
    room.on(RoomEvent.ParticipantConnected, onJoined);
    room.on(RoomEvent.ParticipantDisconnected, onLeft);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
      room.off(RoomEvent.ParticipantConnected, onJoined);
      room.off(RoomEvent.ParticipantDisconnected, onLeft);
    };
  }, [room, publish]);

  const requestAccess = useCallback(() => {
    void requestRemoteControlAccess()
      .then(setStatus)
      .catch((err) => {
        console.warn('[modules.calls] remote control access request failed', err);
      });
  }, []);

  const grant = useCallback(
    (identity: string) => {
      if (!status?.trusted) {
        requestAccess();
        return;
      }
      setController(identity);
      setPending((current) => (current === identity ? null : current));
    },
    [status, requestAccess],
  );

  const revoke = useCallback(() => setController(null), []);

  const deny = useCallback(() => {
    if (pending) publish({ type: 'deny' }, [pending]);
    setPending(null);
  }, [pending, publish]);

  return { status, controller, pending, grant, revoke, deny, requestAccess };
}
