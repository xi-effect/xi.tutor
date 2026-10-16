import { useEffect, useState } from 'react';
import { useRoom } from '@xipkg/calls-providers';
import { collectScreenShareAudio } from './screenShareAudio';
import type { MixerAudioSource } from './audioMixer';

const ROOM_EVENTS = [
  'localTrackPublished',
  'localTrackUnpublished',
  'trackPublished',
  'trackUnpublished',
  'trackSubscribed',
  'trackUnsubscribed',
  'trackMuted',
  'trackUnmuted',
];

export function useScreenShareAudioSources(): MixerAudioSource[] {
  const { room } = useRoom();
  const [, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((current) => current + 1);
    const target = room as unknown as {
      on: (event: string, cb: () => void) => void;
      off: (event: string, cb: () => void) => void;
    };
    for (const event of ROOM_EVENTS) target.on(event, bump);
    return () => {
      for (const event of ROOM_EVENTS) target.off(event, bump);
    };
  }, [room]);

  return collectScreenShareAudio(room);
}
