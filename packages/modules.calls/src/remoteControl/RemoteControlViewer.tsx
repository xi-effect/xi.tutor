/**
 * Viewer side of remote control: a "request control" pill on a remote screen
 * share and, once granted, an input layer over the video that streams mouse
 * and keyboard to the sharer. Works in the browser app as well as in the shell.
 */

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { useLocalParticipant, useRoomContext, useTracks } from '@livekit/components-react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { RoomEvent, Track, type Participant } from 'livekit-client';
import { Hand } from '@xipkg/icons';
import type { RemoteInput, RemoteMouseButton } from 'common.platform';
import { useVideoContentBox, useVideoElement } from '../shareAnnotations/videoElement';
import { keyboardEventToInput, modifiersOf, remoteOrigin } from './keymap';
import {
  REMOTE_CONTROL_TOPIC,
  decodeRemoteControl,
  encodeRemoteControl,
  type RemoteControlMessage,
} from './protocol';

type HostState = { available: boolean; controller: string | null };
type RequestState = 'pending' | 'denied';

const DENIED_VISIBLE_MS = 4000;
const LINE_HEIGHT_PX = 40;
const PAGE_HEIGHT_PX = 800;
const MOUSE_BUTTONS: Record<number, RemoteMouseButton> = { 0: 'left', 1: 'middle', 2: 'right' };

type Send = (message: RemoteControlMessage, reliable?: boolean) => void;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function wheelScale(event: WheelEvent): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return LINE_HEIGHT_PX;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return PAGE_HEIGHT_PX;
  return 1;
}

function useInputStream(surface: HTMLDivElement | null, send: Send): void {
  const sendRef = useRef(send);
  sendRef.current = send;

  useEffect(() => {
    if (!surface) return;
    const origin = remoteOrigin();
    const pressed = new Set<RemoteMouseButton>();
    let frame = 0;
    let move: { x: number; y: number } | null = null;
    let wheel = { dx: 0, dy: 0 };

    const input = (value: RemoteInput, reliable = true) =>
      sendRef.current({ type: 'input', input: value }, reliable);

    const pointOf = (event: MouseEvent) => {
      const rect = surface.getBoundingClientRect();
      return {
        x: clamp01((event.clientX - rect.left) / rect.width),
        y: clamp01((event.clientY - rect.top) / rect.height),
      };
    };

    const flush = () => {
      frame = 0;
      if (move) {
        input({ type: 'move', ...move }, false);
        move = null;
      }
      const dx = Math.round(wheel.dx);
      const dy = Math.round(wheel.dy);
      if (dx !== 0 || dy !== 0) {
        input({ type: 'wheel', dx, dy }, false);
        wheel = { dx: 0, dy: 0 };
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(flush);
    };

    const block = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const onMove = (event: MouseEvent) => {
      // Keep dragging when the pointer leaves the video while a button is held.
      if (pressed.size === 0 && !surface.contains(event.target as Node)) return;
      move = pointOf(event);
      schedule();
    };

    const button = (event: MouseEvent, down: boolean) => {
      const which = MOUSE_BUTTONS[event.button];
      if (!which) return;
      if (down) pressed.add(which);
      else if (!pressed.delete(which)) return;
      move = null;
      input({
        type: 'button',
        ...pointOf(event),
        button: which,
        down,
        clicks: Math.max(1, event.detail || 1),
        mods: modifiersOf(event),
        origin,
      });
    };

    const onDown = (event: MouseEvent) => {
      block(event);
      surface.focus({ preventScroll: true });
      button(event, true);
    };
    const onUp = (event: MouseEvent) => {
      if (pressed.size === 0) return;
      if (surface.contains(event.target as Node)) block(event);
      button(event, false);
    };

    const onWheel = (event: WheelEvent) => {
      block(event);
      const scale = wheelScale(event);
      wheel = { dx: wheel.dx + event.deltaX * scale, dy: wheel.dy + event.deltaY * scale };
      schedule();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      block(event);
      const value = keyboardEventToInput(event, origin);
      if (value) input(value);
    };

    // Tile handlers (pin, fullscreen on double click) sit under the layer.
    // No preventDefault on pointerdown: Chromium then drops the mousedown used above.
    const swallowed = ['click', 'dblclick', 'auxclick', 'pointerdown', 'pointerup'];
    const stop = (event: Event) => event.stopPropagation();

    surface.addEventListener('mousedown', onDown);
    surface.addEventListener('wheel', onWheel, { passive: false });
    surface.addEventListener('keydown', onKeyDown);
    surface.addEventListener('keyup', block);
    surface.addEventListener('contextmenu', block);
    for (const type of swallowed) surface.addEventListener(type, stop);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    surface.focus({ preventScroll: true });

    return () => {
      surface.removeEventListener('mousedown', onDown);
      surface.removeEventListener('wheel', onWheel);
      surface.removeEventListener('keydown', onKeyDown);
      surface.removeEventListener('keyup', block);
      surface.removeEventListener('contextmenu', block);
      for (const type of swallowed) surface.removeEventListener(type, stop);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (frame) window.cancelAnimationFrame(frame);
      for (const which of pressed) {
        input({
          type: 'button',
          x: move?.x ?? 0.5,
          y: move?.y ?? 0.5,
          button: which,
          down: false,
          clicks: 1,
          mods: { shift: false, ctrl: false, alt: false, meta: false },
          origin,
        });
      }
    };
  }, [surface]);
}

type LayerProps = {
  video: HTMLVideoElement;
  controlling: boolean;
  controllerName: string | null;
  request: RequestState | undefined;
  onRequest(): void;
  onRelease(): void;
  send: Send;
};

const pillClass =
  'pointer-events-auto flex items-center gap-2 rounded-full bg-black/70 py-1 pl-3 text-xs-base text-white shadow-lg backdrop-blur';
const pillButtonClass =
  'bg-brand-80 hover:bg-brand-90 active:bg-brand-100 text-text-on-accent flex items-center gap-1.5 rounded-full px-3 py-1 font-medium';

const ControlLayer = ({
  video,
  controlling,
  controllerName,
  request,
  onRequest,
  onRelease,
  send,
}: LayerProps) => {
  const box = useVideoContentBox(video);
  const [surface, setSurface] = useState<HTMLDivElement | null>(null);
  useInputStream(controlling ? surface : null, send);

  const parent = video.parentElement;
  if (!parent || !box) return null;

  let pill: ReactElement;
  if (controlling) {
    pill = (
      <div className={`${pillClass} pr-1`}>
        <span>Вы управляете экраном</span>
        <button type="button" className={pillButtonClass} onClick={onRelease}>
          Завершить
        </button>
      </div>
    );
  } else if (controllerName) {
    pill = <div className={`${pillClass} pr-3`}>Управляет {controllerName}</div>;
  } else if (request === 'pending') {
    pill = <div className={`${pillClass} pr-3`}>Ждём разрешения…</div>;
  } else {
    pill = (
      <div className={`${pillClass} pr-1`}>
        {request === 'denied' ? <span>Запрос отклонён</span> : null}
        <button type="button" className={pillButtonClass} onClick={onRequest}>
          <Hand className="h-3.5 w-3.5 fill-current" />
          Запросить управление
        </button>
      </div>
    );
  }

  return createPortal(
    <div
      style={{
        position: 'absolute',
        left: video.offsetLeft + box.left,
        top: video.offsetTop + box.top,
        width: box.width,
        height: box.height,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      {controlling ? (
        <div
          ref={setSurface}
          tabIndex={0}
          aria-label="Удалённое управление экраном"
          className="ring-brand-80 absolute inset-0 cursor-default ring-2 outline-none ring-inset"
          style={{ pointerEvents: 'auto' }}
        />
      ) : null}
      <div className="absolute top-2 left-1/2 -translate-x-1/2">{pill}</div>
    </div>,
    parent,
  );
};

type SharerProps = Omit<LayerProps, 'video'> & { trackReference: TrackReferenceOrPlaceholder };

const SharerControl = ({ trackReference, ...props }: SharerProps) => {
  const video = useVideoElement(trackReference.publication?.track?.mediaStreamTrack?.id);
  if (!video) return null;
  return <ControlLayer video={video} {...props} />;
};

export const RemoteControlViewer = () => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [hosts, setHosts] = useState<Record<string, HostState>>({});
  const [requests, setRequests] = useState<Record<string, RequestState>>({});
  const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], {
    onlySubscribed: true,
  });
  const deniedTimers = useRef(new Map<string, number>());

  const setRequest = useCallback((identity: string, value: RequestState | null) => {
    setRequests((current) => {
      if (value === null) {
        if (!(identity in current)) return current;
        const next = { ...current };
        delete next[identity];
        return next;
      }
      return { ...current, [identity]: value };
    });
  }, []);

  const publishTo = useCallback(
    (identity: string, message: RemoteControlMessage, reliable = true) => {
      void localParticipant
        .publishData(encodeRemoteControl(message), {
          reliable,
          topic: REMOTE_CONTROL_TOPIC,
          destinationIdentities: [identity],
        })
        .catch((err) => {
          if (reliable) console.warn('[modules.calls] remote control message failed', err);
        });
    },
    [localParticipant],
  );

  useEffect(() => {
    const timers = deniedTimers.current;
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

      if (message.type === 'state') {
        setHosts((current) => ({
          ...current,
          [identity]: {
            available: Boolean(message.available),
            controller: message.controller ?? null,
          },
        }));
        if (!message.available || message.controller === room.localParticipant.identity) {
          setRequest(identity, null);
        }
      } else if (message.type === 'deny') {
        setRequest(identity, 'denied');
        window.clearTimeout(timers.get(identity));
        timers.set(
          identity,
          window.setTimeout(() => setRequest(identity, null), DENIED_VISIBLE_MS),
        );
      }
    };

    const onLeft = (participant: Participant) => {
      setHosts((current) => {
        if (!(participant.identity in current)) return current;
        const next = { ...current };
        delete next[participant.identity];
        return next;
      });
      setRequest(participant.identity, null);
    };

    room.on(RoomEvent.DataReceived, onData);
    room.on(RoomEvent.ParticipantDisconnected, onLeft);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
      room.off(RoomEvent.ParticipantDisconnected, onLeft);
      for (const timer of timers.values()) window.clearTimeout(timer);
      timers.clear();
    };
  }, [room, setRequest]);

  const localIdentity = localParticipant.identity;

  return (
    <>
      {tracks.map((trackReference) => {
        const participant = trackReference.participant;
        if (participant.isLocal) return null;
        const identity = participant.identity;
        const host = hosts[identity];
        if (!host?.available) return null;
        const controller = host.controller;
        const controllerName = controller
          ? (room.getParticipantByIdentity(controller)?.name ?? controller)
          : null;
        return (
          <SharerControl
            key={trackReference.publication?.trackSid ?? identity}
            trackReference={trackReference}
            controlling={controller === localIdentity}
            controllerName={controller === localIdentity ? null : controllerName}
            request={requests[identity]}
            onRequest={() => {
              setRequest(identity, 'pending');
              publishTo(identity, { type: 'request' });
            }}
            onRelease={() => {
              publishTo(identity, { type: 'release' });
              setHosts((current) => ({ ...current, [identity]: { ...host, controller: null } }));
            }}
            send={(message, reliable) => publishTo(identity, message, reliable)}
          />
        );
      })}
    </>
  );
};
